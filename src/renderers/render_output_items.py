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
    return yaml.dump(data, sort_keys=False)

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