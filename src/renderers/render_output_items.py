import os
import yaml
import logging
import re
from typing import Any, Callable, Optional

from component import Context, SettingDependency, WORKSPACE_NAME_SETTING, \
    LOCATION_ID_SETTING, WORKSPACE_OUTPUT_PATH_SETTING
from template import render_template_file, render_template_string

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


def load_hierarchy_template(platform_name: str) -> dict:
    """
    Load platform-specific hierarchy template from file.
    Falls back to kubernetes if platform-specific template not found.
    """
    template_path = os.path.join(os.path.dirname(__file__), "..", "templates", "hierarchy", f"{platform_name}.yaml")
    try:
        with open(template_path, "r") as f:
            content = f.read()
            return yaml.safe_load(content)
    except (FileNotFoundError, yaml.YAMLError) as e:
        logger.warning(f"Could not load hierarchy template for {platform_name}: {str(e)}")
        # Try to load kubernetes template as fallback
        if platform_name != "kubernetes":
            logger.info(f"Falling back to kubernetes hierarchy template")
            return load_hierarchy_template("kubernetes")
        else:
            # Default hierarchy and tags if no template is available
            return {
                "additionalContext": {
                    "hierarchy": ["platform", "resource"]
                },
                "tags": [
                    {"name": "platform", "value": platform_name}
                ]
            }


def load_hierarchy_template_content(platform_name: str) -> str:
    """
    Load the raw content of the hierarchy template file.
    """
    template_path = os.path.join(os.path.dirname(__file__), "..", "templates", "hierarchy", f"{platform_name}.yaml")
    try:
        with open(template_path, "r") as f:
            return f.read()
    except FileNotFoundError:
        if platform_name != "kubernetes":
            logger.info(f"Falling back to kubernetes hierarchy template")
            return load_hierarchy_template_content("kubernetes")
        else:
            # Return default content if file not found
            return """additionalContext:
  hierarchy: ["platform", "resource"]
tags:
  - name: platform
    value: %s
""" % platform_name


def create_slx_template(platform_name: str) -> str:
    """
    Create a ServiceLevelX template with properly structured spec and hierarchy.
    Uses the existing hierarchy template content directly.
    """
    # Get hierarchy section from template
    hierarchy_content = load_hierarchy_template_content(platform_name)
    
    # Properly indent the hierarchy content (add 2 spaces to each line)
    # But exclude the additionalContext section, as we'll include it differently
    indented_content = ""
    skip_additional_context = False
    for line in hierarchy_content.split('\n'):
        if line.strip() == "additionalContext:":
            skip_additional_context = True
            continue
        elif skip_additional_context and line.strip() and not line.startswith('  '):
            skip_additional_context = False
        elif skip_additional_context:
            continue
        
        if line.strip():  # Skip empty lines
            indented_content += f"  {line}\n"
        else:
            indented_content += "\n"
    
    # Extract hierarchy value from the template
    hierarchy_match = re.search(r'hierarchy:\s*(\[.*?\])', hierarchy_content)
    hierarchy_value = hierarchy_match.group(1) if hierarchy_match else '["platform", "resource"]'
    
    return f"""apiVersion: runwhen.com/v1
kind: ServiceLevelX
metadata:
  name: {{{{slx_name}}}}
  labels:
    {{% include "common-labels.yaml" %}}
  annotations:
    {{% include "common-annotations.yaml" %}}
spec:
{indented_content}  imageURL: https://storage.googleapis.com/runwhen-nonprod-shared-images/icons/kubernetes/resources/labeled/ns.svg
  alias: {{{{namespace.name}}}} Namespace Health
  asMeasuredBy: Aggregate score based on Kubernetes API Server queries
  configProvided:
  - name: OBJECT_NAME
    value: {{{{match_resource.resource.metadata.name}}}}
  owners:
  - {{{{workspace.owner_email}}}}
  statement: Overall health for {{{{namespace.name}}}} should be 1, 99% of the time. 
  additionalContext:
    hierarchy: {hierarchy_value}
    namespace: "{{{{match_resource.resource.metadata.name}}}}"
    labelMap: "{{{{match_resource.resource.metadata.labels}}}}"
    cluster: "{{{{ cluster.name }}}}"
    context: "{{{{ cluster.context }}}}"
"""


def fix_jinja_quotes(yaml_text: str) -> str:
    """
    Fix Jinja2 template expressions that might have been quoted incorrectly by PyYAML.
    Specifically, look for patterns like: value: '{{ var | default(''val'') }}'
    and replace with: value: "{{ var | default('val') }}"
    
    Also fix patterns like: value: "{{ var | default(''val'') }}"
    and replace with: value: "{{ var | default('val') }}"
    """
    # Find strings with Jinja2 expressions that have problematic quotes - case 1: single-quoted outer
    pattern1 = r"value: '(\{\{.*?\|.*?default\('.*?'\).*?\}\})'"
    yaml_text = re.sub(pattern1, r'value: "\1"', yaml_text)
    
    # Direct match and fix for the specific pattern seen in the error
    yaml_text = yaml_text.replace("default(''unknown'')", "default('unknown')")
    
    return yaml_text


def preprocess_template_text(template_text: str) -> str:
    """
    Pre-process template text to fix common issues before rendering.
    """
    # Fix double single quotes in Jinja2 default filter
    template_text = re.sub(r"default\(''([^']+)''\)", r"default('\1')", template_text)
    
    # Remove subscription_id field from additionalContext if platform is kubernetes
    if "kind: ServiceLevelX" in template_text and "platform: kubernetes" in template_text:
        template_text = re.sub(r'\s+subscription_id: ".*?"', '', template_text)
    
    return template_text


def fix_yaml_structure(template_text: str) -> str:
    """
    Fix YAML structure issues by ensuring tags are properly structured.
    This is a simple text-based solution that doesn't rely on parsing.
    """
    # Check if we have tags/platform entries and other fields at same level
    if "- name: platform" in template_text and "imageURL:" in template_text:
        # Fix by wrapping the tags section
        template_text = template_text.replace(
            "spec:", 
            "spec:\n  tags:"
        )
        
        # Find where the list items end and other properties begin
        tag_lines = []
        other_lines = []
        in_tags = False
        lines = template_text.split("\n")
        
        for i, line in enumerate(lines):
            if line.strip() == "tags:":
                in_tags = True
            elif line.strip().startswith("- name:"):
                in_tags = True
                tag_lines.append(line)
            elif in_tags and (line.strip().startswith("imageURL:") or 
                             line.strip().startswith("alias:") or
                             line.strip().startswith("configProvided:")):
                in_tags = False
                other_lines.append(line)
            elif in_tags and line.strip().startswith("value:"):
                tag_lines.append(line)
            elif in_tags:
                # Check if this is an indented line under a tag
                if line.startswith("    "):
                    tag_lines.append(line)
                else:
                    in_tags = False
                    other_lines.append(line)
            else:
                other_lines.append(line)
        
        # Rebuild the template with proper structure
        result = []
        in_spec = False
        in_tags = False
        
        for line in lines:
            if line.strip() == "spec:":
                result.append(line)
                in_spec = True
            elif in_spec and line.strip() == "tags:":
                result.append(line)
                in_tags = True
            elif in_spec and line.strip().startswith("- name:"):
                if not in_tags:
                    result.append("  tags:")
                    in_tags = True
                # Add 2 spaces indentation for tags list
                result.append("  " + line)
            elif in_tags and line.strip().startswith("value:"):
                # Add 2 spaces indentation for tag values
                result.append("  " + line)
            elif in_tags and line.strip().startswith("imageURL:") or line.strip().startswith("alias:"):
                # End tags section, start normal properties
                in_tags = False
                result.append(line)
            else:
                result.append(line)
        
        return "\n".join(result)
    
    return template_text


def render(context: Context):
    output_items: dict[str, OutputItem] = context.get_property(OUTPUT_ITEMS_PROPERTY, {})
    for output_item in output_items.values():
        logger.info(f"Rendering output item: {output_item.path}")
        
        # Skip if template_loader_func is not available
        if not output_item.template_loader_func:
            logger.warning(f"No template loader function for {output_item.path}, skipping")
            continue

        # Get the template text
        try:
            template_text = output_item.template_loader_func(output_item.template_name)
        except Exception as e:
            logger.error(f"Failed to load template {output_item.template_name}: {str(e)}")
            continue

        if not template_text:
            logger.error(f"Empty template text for {output_item.template_name}")
            continue

        # If this is a ServiceLevelX, create a new template with proper structure
        if "kind: ServiceLevelX" in template_text:
            # Get platform information
            match_resource = output_item.template_variables.get("match_resource")
            platform_name = None
            
            if match_resource and hasattr(match_resource, 'resource_type') and \
               hasattr(match_resource.resource_type, 'platform') and \
               hasattr(match_resource.resource_type.platform, 'name'):
                platform_name = match_resource.resource_type.platform.name
            
            if not platform_name:
                # Default to kubernetes if platform can't be determined
                platform_name = "kubernetes"
            
            logger.info(f"Processing ServiceLevelX with platform: {platform_name}")
            
            # Create a new template with proper structure
            template_text = create_slx_template(platform_name)

        try:
            # Render the template
            output_text = render_template_string(template_text, output_item.template_variables, output_item.template_loader_func)
            
            # Check if we can parse as valid YAML
            try:
                yaml.safe_load(output_text)
            except yaml.YAMLError as e:
                logger.error(f"YAML validation error: {str(e)}")
                logger.error(f"Problematic YAML content:\n{output_text}")
                raise
            
            # Write the output to file
            context.write_file(output_item.path, output_text)
            
        except Exception as e:
            logger.error(f"Failed to render or save {output_item.path}: {str(e)}")
            logger.error("Exception details:", exc_info=True)