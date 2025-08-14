import os
import yaml
import logging
from typing import Any, Callable, Optional, List

from component import Context, SettingDependency, WORKSPACE_NAME_SETTING, \
    LOCATION_ID_SETTING, WORKSPACE_OUTPUT_PATH_SETTING
from template import render_template_file
from exceptions import WorkspaceBuilderException

logger = logging.getLogger(__name__)

# Check for the environment variable and set the log level
if os.environ.get('DEBUG_LOGGING') == 'true':
    logger.setLevel(logging.DEBUG)
else:
    logger.setLevel(logging.INFO)

DOCUMENTATION = "Render templated output items"

# FIXME: Not sure these settings dependencies are still needed/valid?
SETTINGS = (
    SettingDependency(LOCATION_ID_SETTING, True),
    SettingDependency(WORKSPACE_NAME_SETTING, True),
    SettingDependency(WORKSPACE_OUTPUT_PATH_SETTING, True),
)

OUTPUT_ITEMS_PROPERTY = "output_items"


class OutputItem:
    path: str
    template_name: str
    template_loader_func: Optional[Callable[[str], str]]
    template_variables: dict[str, Any]

    def __init__(self, path: str,
                 template_name: str,
                 template_variables: dict[str, Any],
                 template_loader_func: Optional[Callable[[str], str]] = None):
        self.path = path
        self.template_name = template_name
        self.template_loader_func = template_loader_func
        self.template_variables = template_variables


def load(context: Context):
    # Initialize the output items dict so that other components don't need to
    # check for None and initialize it themselves.
    context.set_property(OUTPUT_ITEMS_PROPERTY, dict())


def deduplicate_secrets_provided(yaml_text: str) -> str:
    """
    Deduplicates entries under 'secretsProvided' in a YAML document.
    """
    data = yaml.safe_load(yaml_text)  # Load the YAML as a Python dictionary
    if 'secretsProvided' in data['spec']:
        secrets = data['spec']['secretsProvided']
        # Deduplicate based on the 'name' key
        unique_secrets = {secret['name']: secret for secret in secrets}.values()
        data['spec']['secretsProvided'] = list(unique_secrets)
    
    # CRITICAL FIX: Ensure all tag values remain as quoted strings to prevent K8s reconciliation errors
    if 'spec' in data and 'tags' in data['spec']:
        for tag in data['spec']['tags']:
            if 'value' in tag:
                tag['value'] = str(tag['value'])  # Force all tag values to strings
    
    # Use PyYAML with explicit string representation to ensure all values are quoted
    return yaml.dump(data, sort_keys=False, default_flow_style=False, allow_unicode=True, default_style='"')

def apply_config_provided_overrides(context: Context, output_text: str, output_item: OutputItem) -> str:
    """
    Apply configProvided overrides to the rendered output by modifying the YAML content.
    """
    try:
        overrides = context.get_property("overrides", {})
        if not overrides or "codebundles" not in overrides:
            return output_text
            
        # Parse the rendered YAML
        import yaml
        try:
            parsed_yaml = yaml.safe_load(output_text)
        except yaml.YAMLError:
            logger.warning(f"Could not parse YAML for override processing: {output_item.path}")
            return output_text
            
        # Check if this is a file that has configProvided section
        if not parsed_yaml or not isinstance(parsed_yaml, dict):
            return output_text
            
        spec = parsed_yaml.get('spec', {})
        config_provided = spec.get('configProvided', [])
        if not config_provided:
            return output_text
            
        # Extract codebundle info from template variables
        template_vars = output_item.template_variables
        current_repo_url = template_vars.get('repo_url', '')
        # Extract codebundle directory from the source generation rule path
        generation_rule_path = template_vars.get('generation_rule_file_path', '')
        if 'codebundles/' in generation_rule_path:
            current_codebundle_dir = generation_rule_path.split('codebundles/')[1].split('/')[0]
        else:
            return output_text
            
        # Determine the type based on the file kind
        file_kind = parsed_yaml.get('kind', '').lower()
        if file_kind == 'runbook':
            current_type = 'runbook'
        elif file_kind == 'servicelevelindicator':
            current_type = 'sli'
        else:
            return output_text
            
        logger.debug(f"Post-render override check for: repo_url='{current_repo_url}', codebundle_dir='{current_codebundle_dir}', type='{current_type}'")
        
        # Find matching override
        codebundle_overrides = overrides["codebundles"]
        for override in codebundle_overrides:
            override_repo_url = override.get('repoURL', '')
            override_codebundle_dir = override.get('codebundleDirectory', '')
            override_type = override.get('type', '').lower()
            
            logger.debug(f"Post-render comparing with override: repo_url='{override_repo_url}', codebundle_dir='{override_codebundle_dir}', type='{override_type}'")
            
            # Check if this override matches the current codebundle
            if (override_repo_url == current_repo_url and 
                override_codebundle_dir == current_codebundle_dir and 
                override_type == current_type):
                
                logger.info(f"POST-RENDER MATCH FOUND! Applying overrides for {current_codebundle_dir}/{current_type}")
                
                # Apply variable overrides to configProvided section
                config_overrides = override.get('configProvided', {})
                for var_name, var_value in config_overrides.items():
                    # Find and update the configProvided entry
                    for config_item in config_provided:
                        if config_item.get('name') == var_name:
                            old_value = config_item.get('value')
                            config_item['value'] = str(var_value)
                            logger.info(f"POST-RENDER Applied configProvided override: {var_name} = {var_value} (was: {old_value})")
                            break
                
                # CRITICAL FIX: Ensure all tag values remain as quoted strings before re-serializing
                if 'spec' in parsed_yaml and 'tags' in parsed_yaml['spec']:
                    for tag in parsed_yaml['spec']['tags']:
                        if 'value' in tag:
                            tag['value'] = str(tag['value'])  # Force all tag values to strings
                
                # Re-serialize the YAML with explicit string representation
                return yaml.dump(parsed_yaml, default_flow_style=False, sort_keys=False, allow_unicode=True, default_style='"')
                
        return output_text
        
    except Exception as e:
        logger.warning(f"Error in post-render configProvided override processing: {e}")
        return output_text

def render(context: Context):
    output_items: dict[str, OutputItem] = context.get_property(OUTPUT_ITEMS_PROPERTY, {})
    skipped_templates: List[dict] = []
    
    for output_item in output_items.values():
        logger.info(f"Rendering output item: {output_item.path}")
        if logger.isEnabledFor(logging.DEBUG):
            logger.debug(f"Template variables for {output_item.path}: {output_item.template_variables}")

        try:
            # Render the template
            output_text = render_template_file(output_item.template_name,
                                              output_item.template_variables,
                                              output_item.template_loader_func)

            # Deduplicate 'secretsProvided'
            deduplicated_output = deduplicate_secrets_provided(output_text)

            # Apply configProvided overrides
            deduplicated_output = apply_config_provided_overrides(context, deduplicated_output, output_item)

            # Write the deduplicated output to the file
            context.write_file(output_item.path, deduplicated_output)
        except WorkspaceBuilderException as e:
            # Log the error but don't fail
            logger.warning(f"Skipping template {output_item.template_name} for {output_item.path}: {str(e)}")
            skipped_templates.append({
                "path": output_item.path,
                "template": output_item.template_name,
                "error": str(e)
            })
        except Exception as e:
            # Catch any other exceptions during rendering
            logger.warning(f"Unexpected error rendering {output_item.template_name} for {output_item.path}: {str(e)}")
            skipped_templates.append({
                "path": output_item.path,
                "template": output_item.template_name,
                "error": str(e)
            })
    
    # Generate report of skipped templates if any
    if skipped_templates:
        report_content = "# Skipped Templates Report\n\n"
        report_content += f"Total skipped templates: {len(skipped_templates)}\n\n"
        
        for i, item in enumerate(skipped_templates, 1):
            report_content += f"## {i}. {item['path']}\n"
            report_content += f"- Template: {item['template']}\n"
            report_content += f"- Error: {item['error']}\n\n"
        
        # Write report to a file
        report_path = os.path.join(context.get_setting(WORKSPACE_OUTPUT_PATH_SETTING), "skipped_templates_report.md")
        context.write_file(report_path, report_content)
        logger.info(f"Generated skipped templates report at {report_path}")