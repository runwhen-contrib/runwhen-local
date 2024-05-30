import logging, os
from typing import Any, Optional

import boto3

from component import Context
from resources import Resource, Registry, REGISTRY_PROPERTY_NAME
from .generation_rule_types import PlatformHandler, LevelOfDetail
from exceptions import WorkspaceBuilderException
AWS_PLATFORM = "aws"
logger = logging.getLogger(__name__)

# Check for the environment variable and set the log level
if os.environ.get('DEBUG_LOGGING') == 'true':
    logger.setLevel(logging.DEBUG)
else:
    logger.setLevel(logging.INFO)
def get_resource_group(resource: Resource) -> Optional[Resource]:
    # FIXME: Shouldn't use hard-coded string here
    if resource.resource_type.name == "resource_group":
        return resource
    try:
        return getattr(resource, "resource_group")
    except AttributeError:
        return None

class ARN:
    partition: str
    service: str
    region: str
    account: str
    resource_type: str
    resource_id: str

    def __init__(self, arn_string):
        parts = arn_string.split(':', 5)
        self.partition = parts[1]
        self.service = parts[2]
        self.region = parts[3]
        self.account = parts[4]
        resource_info = parts[5]
        # Annoyingly different resource type can use either a ':' or a '/' as the
        # separator between the resource type and id fields, so we try both.
        resource_parts = resource_info.split(':', 1)
        if len(resource_parts) < 2:
            resource_parts = resource_info.split('/', 1)
        self.resource_type = resource_parts[0] if len(resource_parts) > 0 else None
        # we need to handle naming edge cases where a / and type are not included in the resource name
        # eg: arn:aws:ec2:us-west-2:1234567890:instance/i-1234567890abcdef vs arn:aws:s3:::my_bucket
        if self.resource_type is None:
            self.resource_type = self.service
        if len(resource_parts) > 1:
            self.resource_id = resource_parts[1]
        elif len(resource_parts) == 1 and '/' not in resource_parts[0]:
            self.resource_id = resource_parts[0]
        else:
            self.resource_id = None

class AWSPlatformHandler(PlatformHandler):

    def __init__(self):
        super().__init__(AWS_PLATFORM)

    def transform_cloud_config(self, cloud_config: dict[str, Any], cq_temp_dir: str) -> None:
        aws_role_arn = cloud_config.get("awsRoleArn")
        if aws_role_arn:

            # Create a client object for the STS service using the original
            # credentials from the cloud config. We copy these original credentials
            # from the cloud config into separate keys that are prefixed with
            # "original", since we're going to be replacing them with the temporary
            # credentials associated with the assumed role. Currently, we don't really
            # need/use these copies except for debugging, but they could be handy
            # if/when we need to support multiple roles with multiple invocations of
            # CloudQuery with the different roles.
            aws_access_key_id = cloud_config.get("awsAccessKeyId")
            aws_secret_access_key = cloud_config.get("awsSecretAccessKey")
            aws_session_token = cloud_config.get("awsSessionToken")
            aws_credentials = dict()
            if aws_access_key_id:
                aws_credentials['aws_access_key_id'] = aws_access_key_id
                cloud_config["originalAwsAccessKeyId"] = aws_access_key_id
            if aws_secret_access_key:
                aws_credentials['aws_secret_access_key'] = aws_secret_access_key
                cloud_config["originalAwsSecretAccessKey"] = aws_secret_access_key
            if aws_session_token:
                aws_credentials['aws_session_token'] = aws_session_token
                cloud_config["originalAwsSessionToken"] = aws_session_token
            sts_client = boto3.client('sts', **aws_credentials)

            # Create the assumed role for the given role ARN
            # FIXME: Shouldn't use a hard-coded name for the session.
            # I'm assuming this would cause problems if there are concurrent workspace builder invocations.
            # But that's not really a use case we've really tested and claim to support now.
            assumed_role_object = sts_client.assume_role(RoleArn=aws_role_arn,
                                                         RoleSessionName="WorkspaceBuilderAWSRoleSession")

            # Extract the credentials from the assumed role object
            credentials = assumed_role_object['Credentials']
            new_aws_access_key_id = credentials.get('AccessKeyId')
            new_aws_secret_access_key = credentials.get('SecretAccessKey')
            new_aws_session_token = credentials.get("SessionToken")

            # Update the cloud config with the assumed role credentials
            cloud_config["awsAccessKeyId"] = new_aws_access_key_id
            cloud_config["awsSecretAccessKey"] = new_aws_secret_access_key
            cloud_config["awsSessionToken"] = new_aws_session_token

    def parse_resource_data(self,
                            resource_data: dict[str,Any],
                            resource_type_name: str,
                            platform_config_data: dict[str,Any],
                            context: Context) -> tuple[str, str, dict[str, Any]]:
        # From testing even with a limited number of AWS resource types, there's not a consistent
        # name in the resource data for the name/id of the resource. For example for a resource group
        # it's called "name", but for an EC2 instance it's called instance_id. But it does seem like
        # all the resources (I think?) will have an "arn" field that we can parse to extract the name/id
        # value, so that's how we handle this. From googling around a bit it seems like there are some
        # informal guarantees that the name/id is unique, even across regions, although I'm somewhat
        # dubious of that, but I'll assume that's true at least for now. What this means is that we
        # can just use the simple name/id as the qualified name without qualifying it with any other
        # info. If this turns out to not be true, then we could scope if with the region or possibly
        # just use the ARN value directly as the qualified name.
        arn_string = resource_data['arn']
        arn = ARN(arn_string)
        name = arn.resource_id
        qualified_name = name
        tags = resource_data.get('tags', dict())
        resource_attributes = {'tags': tags}

        # Since the resource group support that I tried to get working doesn't seem to work with
        # CloudQuery, I'm just going to support a per-resource mechanism for tagging with the
        # LOD value. Note that this is a something that's been requested as a feature across all
        # the indexers, so I should also get it working for the other cloud platforms, but for
        # now it's only supported on AWS.
        for tag_key, tag_value in tags.items():
            if tag_key.lower() in ('lod', 'levelofdetail', 'level-of-detail'):
                try:
                    lod = LevelOfDetail.construct_from_config(tag_value)
                    break
                except WorkspaceBuilderException:
                    pass
        else:
            lod = context.get_setting("DEFAULT_LOD")
        resource_attributes['lod'] = lod

        # FIXME: Disabling all of this resource-group-specific code until I figure out if
        # there's a way to actually support. It doesn't appear to be possible with what you
        # get from CloudQuery and would presumably require a separate call to the native
        # AWS python library to resolve the resource instance members of the resource group.
        # if resource_type_name == "resource_group":
        #     # Set the 'lod' (level-of-detail) resource attribute from the per-resource-group
        #     # setting in the AWS cloud config or set to the default value if it's unspecified
        #     # FIXME: It's a big kludgy to have the level of detail setting in the resource,
        #     # since that's really a generation rules feature, not an indexing feature.
        #     # Although we do currently use it in kubeapi to optimize the indexing to skip indexing
        #     # namespaces whose level-of-detail is "none". But I still think it would be
        #     # cleaner to not have any LOD setting logic in the indexers and just use it
        #     # internally in the generation rules module. There could be some other mechanism
        #     # to disable indexing for particular namespaces / resource groups in the indexers.
        #     # In any case, we want to skip the else logic here that tries to extract
        #     # the parent resource group of the resource since that doesn't make sense
        #     # for the resource group itself (unless Azure supports nested resource
        #     # groups? but I don't think it does).
        #     resource_group_level_of_detail_config = platform_config_data.get("resourceGroupLevelOfDetails", dict())
        #     resource_group_lod_value = resource_group_level_of_detail_config.get(name)
        #     # FIXME: Not great maintainance-wise to lookup setting values by the setting name here.
        #     # Would be better to lookup by the actual Setting class singleton (which is not supported
        #     # by the get_setting method). Unfortunately, currently, if we try to use the default LOD
        #     # setting it leads to a module import circularity, so some cleanup/refactoring of
        #     # where the settings are defined is needed to get that to work. So for the time being
        #     # we still use the hard-coded name :-(
        #     resource_attributes['lod'] = LevelOfDetail.construct_from_config(resource_group_lod_value) \
        #         if resource_group_lod_value is not None else context.get_setting("DEFAULT_LOD")
        # else:
        #     resource_group_name = resource_data.get("resourceGroup")
        #     if resource_group_name:
        #         # Lookup the associated resource group instance from the resource registry
        #         registry: Registry = context.get_property(REGISTRY_PROPERTY_NAME)
        #         resource_group_resource_type = registry.lookup_resource_type(AWS_PLATFORM, "resource_group")
        #         if resource_group_resource_type:
        #             for resource_group in resource_group_resource_type.instances.values():
        #                 if resource_group.name.upper() == resource_group_name.upper():
        #                     resource_attributes['resource_group'] = resource_group
        #                     break
        #         qualified_name = f"{resource_group_name}/{name}"

        return name, qualified_name, resource_attributes

    def get_level_of_detail(self, resource: Resource) -> Optional[LevelOfDetail]:
        # resource_group = get_resource_group(resource)
        # if not resource_group:
        #     return None
        # level_of_detail = getattr(resource_group, 'lod')
        level_of_detail = getattr(resource, 'lod')
        return level_of_detail

    # @staticmethod
    # def get_common_resource_property_values(resource: Resource, qualifier_name: str) -> Optional[str]:
    #     if qualifier_name == "resource_group":
    #         return get_resource_group(resource).name
    #     else:
    #         # FIXME: Should we treat this as an error, i.e. raise Exception?
    #         return None
    #
    # def get_resource_qualifier_value(self, resource: Resource, qualifier_name: str) -> Optional[str]:
    #     return self.get_common_resource_property_values(resource, qualifier_name)

    def get_resource_property_values(self, resource: Resource, property_name: str) -> Optional[list[Any]]:
        property_name = property_name.lower()
        tags = getattr(resource, "tags")
        if property_name == "tags":
            return list(tags.keys()) + list(tags.values())
        elif property_name == "tag-keys":
            return list(tags.keys())
        elif property_name == "tag-values":
            return list(tags.values())
        else:
            # Note, the property value may be a path within the
            return None

    # def get_standard_template_variables(self, resource: Resource) -> dict[str, Any]:
    #     template_variables = dict()
    #     resource_group = get_resource_group(resource)
    #     if resource_group:
    #         template_variables['resource_group'] = resource_group
    #     return template_variables
    #
    # def resolve_template_variable_value(self, resource: Resource, variable_name: str) -> Optional[Any]:
    #     return self.get_common_resource_property_values(resource, variable_name)


