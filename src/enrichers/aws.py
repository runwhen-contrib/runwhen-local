import logging
import os
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


class ARN:
    def __init__(self, arn_string: str):
        parts = arn_string.split(':', 5)
        self.partition = parts[1]
        self.service = parts[2]
        self.region = parts[3]
        self.account = parts[4]
        resource_info = parts[5]
        resource_parts = resource_info.split(':', 1) if ':' in resource_info else resource_info.split('/', 1)
        self.resource_type = resource_parts[0] if resource_parts else self.service
        self.resource_id = resource_parts[1] if len(resource_parts) > 1 else resource_parts[0]


class AWSPlatformHandler(PlatformHandler):
    def __init__(self):
        super().__init__(AWS_PLATFORM)

    def parse_resource_data(
        self,
        resource_data: dict[str, Any],
        resource_type_name: str,
        platform_config_data: dict[str, Any],
        context: Context
    ) -> tuple[str, str, dict[str, Any]]:
        # Extract ARN and validate
        arn_string = resource_data.get("arn")
        if not arn_string:
            raise ValueError("ARN is required for AWS resource data.")

        arn = ARN(arn_string)
        name = resource_data.get("name", arn.resource_id)  # Fallback to ARN resource_id
        qualified_name = name
        tags = resource_data.get("tags", {})
        resource_attributes = {
            'tags': tags,
            'account_id': resource_data.get('account_id', arn.account),
            'region': resource_data.get('region', arn.region),
            'service': arn.service,
            'arn': arn_string,
            'is_public': resource_data.get('policy_status', {}).get('IsPublic', False),
        }

        # Handle level of detail (LOD)
        for tag_key, tag_value in tags.items():
            if tag_key.lower() in ('lod', 'levelofdetail', 'level-of-detail'):
                try:
                    lod = LevelOfDetail.construct_from_config(tag_value)
                    break
                except WorkspaceBuilderException:
                    logger.warning(f"Invalid LOD value in tag: {tag_value}")
        else:
            lod = context.get_setting("DEFAULT_LOD")
        resource_attributes['lod'] = lod

        # Generate qualified name if applicable
        if resource_type_name == "aws_s3_buckets":
            qualified_name = f"{resource_attributes['account_id']}:{resource_attributes['region']}:{name}"

        return name, qualified_name, resource_attributes

    def get_resource_qualifier_value(self, resource: Resource, qualifier_name: str) -> Optional[str]:
        if qualifier_name == "account_id":
            return getattr(resource, "account_id", None)
        elif qualifier_name == "region":
            return getattr(resource, "region", None)
        elif qualifier_name == "service":
            return getattr(resource, "service", None)
        elif qualifier_name == "is_public":
            return str(getattr(resource, "is_public", False)).lower()
        elif qualifier_name == "arn":
            return getattr(resource, "arn", None)
        else:
            logger.warning(f"Unknown qualifier requested: {qualifier_name}")
            return None

    def get_resource_property_values(self, resource: Resource, property_name: str) -> Optional[list[Any]]:
        property_name = property_name.lower()
        tags = getattr(resource, "tags", {})
        if property_name == "tags":
            return list(tags.keys()) + list(tags.values())
        elif property_name == "tag-keys":
            return list(tags.keys())
        elif property_name == "tag-values":
            return list(tags.values())
        elif property_name in ("account_id", "region", "service", "arn", "is_public"):
            return [self.get_resource_qualifier_value(resource, property_name)]
        else:
            logger.warning(f"Unknown property requested: {property_name}")
            return None

    def get_standard_template_variables(self, resource: Resource) -> dict[str, Any]:
        template_variables = {
            'account_id': self.get_resource_qualifier_value(resource, "account_id"),
            'region': self.get_resource_qualifier_value(resource, "region"),
            'service': self.get_resource_qualifier_value(resource, "service"),
            'is_public': self.get_resource_qualifier_value(resource, "is_public"),
        }
        return template_variables

    def resolve_template_variable_value(self, resource: Resource, variable_name: str) -> Optional[Any]:
        return self.get_resource_qualifier_value(resource, variable_name)
