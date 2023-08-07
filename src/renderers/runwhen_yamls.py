"""
    Generate the RunWhen workspace, slx, sli, slo and taskset yaml files.

    Requires a handful of settings:

    RUNWHEN_MANIFESTS: a path to where a directory of yamls should be put (defaults to cwd)
    WORKSPACE_OWNER_EMAIL: an email address for the owner (e.g. kyle.forster@runwhen.com)
    DEFAULT_LOCATION: the RunWhen location to be used for SLIs and TaskSets (e.g. beta-location-us-west2-01)
"""


import os
import yaml

import models
from exceptions import ProdGraphUserException

import logging
logger = logging.getLogger(__name__)

from component import Setting, SettingDependency, Context , KUBECONFIG_SETTING, \
    WORKSPACE_OWNER_EMAIL_SETTING, WORKSPACE_NAME_SETTING, \
    DEFAULT_LOCATION_SETTING, WORKSPACE_OUTPUT_PATH_SETTING


DOCUMENTATION = "Render/generate RunWhen workspace, SLX, SLI, SLO and taskset YAML files"

SETTINGS = (
    SettingDependency(WORKSPACE_OWNER_EMAIL_SETTING, True),
    SettingDependency(DEFAULT_LOCATION_SETTING, True),
    SettingDependency(WORKSPACE_OUTPUT_PATH_SETTING, True),
    SettingDependency(WORKSPACE_NAME_SETTING, True),
    SettingDependency(KUBECONFIG_SETTING, True),
)


def render(context: Context):

    owner_email = context.get_setting('WORKSPACE_OWNER_EMAIL')
    workspace_output_path = context.get_setting("WORKSPACE_OUTPUT_PATH")
    default_location = context.get_setting("RUNWHEN_DEFAULT_LOCATION")
    workspace_name = context.get_setting("WORKSPACE_NAME")

    workspace_models = models.RunWhenWorkspace.nodes.all()
    if len(workspace_models) == 0:
        raise ProdGraphUserException(f"There were no RunWhenWorkspace nodes found in prodgraph db...  did you run the runwhen_default_workspace enricher?")

    workspace = models.RunWhenWorkspace.nodes.get(short_name=workspace_name)

    # Put each workspace in a separate directory
    for workspace_model in workspace_models:
        workspace_base_path = os.path.join(workspace_output_path, workspace_model.short_name)
        workspace_yaml_path = os.path.join(workspace_base_path, "workspace.yaml")
        workspace_yaml = render_workspace_yaml(workspace_model, owner_email)
        context.write_file(workspace_yaml_path, workspace_yaml)
        logger.info(f"wrote workspace.yaml out to {workspace_yaml_path}")
        for slx_model in workspace_model.slxs:
            slx_base_path = os.path.join(workspace_base_path, 'slxs', slx_model.short_name)
            slx_yaml_path = os.path.join(slx_base_path, "slx.yaml")
            slx_yaml = render_slx_yaml(workspace_model, slx_model, owner_email)
            context.write_file(slx_yaml_path, slx_yaml)
            logger.info(f"wrote slx.yaml out to {slx_yaml_path}")
            slx_children_yamls = render_slx_child_yamls(workspace_model, slx_model, default_location)
            for slx_child_filename, slx_child_yaml in slx_children_yamls.items():
                slx_child_path = os.path.join(slx_base_path, slx_child_filename)
                context.write_file(slx_child_path, slx_child_yaml)



def render_workspace_yaml(workspace_model, owner_email):
    w = {
            'kind': 'Workspace',
            'apiVersion': 'runwhen.com/v1',
            'metadata': {
                'name': workspace_model.short_name,
                'labels': {
                    'workspace': workspace_model.short_name,
                },
            },
            'spec': {
                'permissions' : [
                    {
                        'user': owner_email,
                        'role': 'admin'
                    },
                ],
                'enabledLocations' : [],
                'configProvided': [
                    {
                        'name': 'WORKSPACE_PLACEHOLDER',  # An unused placeholder
                        'value': f"{workspace_model.short_name}-placeholder"
                    },
                ],
                'slxGroups': workspace_model.slx_groups,
            },
        }
    return yaml.dump(w)


def render_slx_yaml(workspace_model, slx_model, owner_email):
    s = {
            'kind': 'ServiceLevelX',
            'apiVersion': 'runwhen.com/v1',
            'metadata': {
                'name': f"{workspace_model.short_name}--{slx_model.short_name}",
                'labels': {
                    'workspace': workspace_model.short_name,
                    'slx': f"{workspace_model.short_name}--{slx_model.short_name}"
                },
            },
            'spec': {
                'icon' : slx_model.icon,
                'statement': slx_model.statement,
                'asMeasuredBy': slx_model.as_measured_by,
                'owners': [
                    owner_email,
                ],
                'alias': slx_model.short_name,
                'configProvided': [
                    {
                    'name': 'SLX_PLACEHOLDER',  # An unused placeholder to help ensure users get syntax correct
                    'value': f"{slx_model.short_name}-placeholder"
                    },
                ],
            }
        }
    if hasattr(slx_model, 'config_provided'):   #TODO - decide if there are semantics here other than empty
        for k,v in slx_model.config_provided.items():
            print("s is currently:", s)
            s['spec']['configProvided'].append({
                'name': k,
                'value': v
            })
    return yaml.dump(s)

def slx_child_fields(workspace_model, slx_model, config_provided, secrets_provided, services_provided):
    """ Return a dict of the fields shared across sli.yaml, slo.yaml, runbook/taskset.yaml
    """
    s = {
            'apiVersion': 'runwhen.com/v1',
            'metadata': {
                'name': f"{workspace_model.short_name}--{slx_model.short_name}",
                'labels': {
                    'workspace': workspace_model.short_name,
                    'slx': f"{workspace_model.short_name}--{slx_model.short_name}"
                },
            },
            'spec': {
            },
        }
    if config_provided:
        s['spec']['configProvided'] = []
        for k,v in config_provided.items():
            s['spec']['configProvided'].append({
                'name': k,
                'value': v
            })
    if secrets_provided:   #TODO - this is a placeholder as for now this script will *not* attach secrets
        s['spec']['secretsProvided'] = []
        for k,v in secrets_provided.items():
            s['spec']['secretsProvided'].append({
                'name': k,
                'value': v
            })
    if services_provided:
        s['spec']['servicesProvided'] = []
        for k,v in services_provided.items():
            s['spec']['servicesProvided'].append({
                'name': k,
                'value': v
            })
    return s

def render_slx_child_yamls(workspace_model, slx_model, default_location):
    """Return a dict of <filename>:<yaml_as_string> for sli.yaml, slo.yaml,
       taskset.yaml found in this slx model
    """
    ret = {}
    # Check the codebundles to see if children have been attached:
    if slx_model.taskset_codebundle_repo_url:
        t = slx_child_fields(workspace_model, 
                             slx_model, 
                             slx_model.taskset_config_provided,
                             slx_model.taskset_secrets_provided,
                             slx_model.taskset_services_provided,
                             )
        t['kind'] = "Runbook"
        t['spec']['description'] = slx_model.taskset_description
        t['spec']['codeBundle'] = {
            'repoUrl': slx_model.taskset_codebundle_repo_url,
            'pathToRobot': slx_model.taskset_codebundle_path_to_robot,
            'ref': slx_model.taskset_codebundle_ref
        }
        t['spec']['location'] = default_location
        ret["runbook.yaml"] = yaml.dump(t)

    if slx_model.sli_codebundle_repo_url:
        t = slx_child_fields(workspace_model, 
                             slx_model, 
                             slx_model.sli_config_provided,
                             slx_model.sli_secrets_provided,
                             slx_model.sli_services_provided,
                             )
        t['kind'] = "ServiceLevelIndicator"
        t['spec']['description'] = slx_model.sli_description
        t['spec']['codeBundle'] = {
            'repoUrl': slx_model.sli_codebundle_repo_url,
            'pathToRobot': slx_model.sli_codebundle_path_to_robot,
            'ref': slx_model.sli_codebundle_ref
        }
        t['spec']['displayUnitsLong'] = slx_model.sli_display_units_long
        t['spec']['displayUnitsShort'] = slx_model.sli_display_units_short
        t['spec']['intervalStrategy'] = slx_model.sli_interval_strategy
        t['spec']['intervalSeconds'] = slx_model.sli_interval_seconds
        t['spec']['locations'] = [default_location,]
        ret["sli.yaml"] = yaml.dump(t)

    
    if slx_model.slo_codebundle_repo_url:
        t = slx_child_fields(workspace_model, slx_model)
        t['kind'] = "ServiceLevelObjective"
        t['spec']['description'] = slx_model.sli_description
        t['spec']['codeBundle'] = {
            'repoUrl': slx_model.slo_codebundle_repo_url,
            'pathToYaml': slx_model.slo_codebundle_path_to_yaml,
            'ref': slx_model.slo_codebundle_ref
        }
        t['spec']['sloSpecType'] = slx_model.slo_spec_type
        t['spec']['objective'] = slx_model.slo_objective
        t['spec']['threshold'] = slx_model.slo_threshold
        t['spec']['operand'] = slx_model.slo_operand
        ret["slo.yaml"] = yaml.dump(t)

    return ret

