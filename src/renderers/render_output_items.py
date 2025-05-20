import os
import yaml
import logging
import re
from typing import Any, Callable, Optional

from component import Context, SettingDependency, WORKSPACE_NAME_SETTING, \
    LOCATION_ID_SETTING, WORKSPACE_OUTPUT_PATH_SETTING
from template import render_template_file, render_template_string
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
    if 'secretsProvided' in data.get('spec', {}):
        secrets = data['spec']['secretsProvided']
        # Deduplicate based on the 'name' key
        unique_secrets = {secret['name']: secret for secret in secrets}.values()
        data['spec']['secretsProvided'] = list(unique_secrets)
    return yaml.dump(data, sort_keys=False)


def load_platform_hierarchy_template(platform_name: str) -> dict:
    """
    Load platform-specific hierarchy template from file.
    Falls back to kubernetes if platform-specific template not found.
    Returns a clean dictionary for the specified platform only.
    """
    template_path = os.path.join(os.path.dirname(__file__), "..", "templates", "hierarchy", f"{platform_name}.yaml")
    try:
        with open(template_path, "r") as f:
            content = f.read()
            # Don't parse with YAML if it contains Jinja2 expressions
            if "{%" in content or "{{" in content:
                logger.info(f"Template {platform_name}.yaml contains Jinja2 expressions, using hardcoded defaults")
                # Use hardcoded defaults instead
                if platform_name == "kubernetes":
                    return {
                        "additionalContext": {
                            "hierarchy": ["platform", "cluster", "namespace", "resource"]
                        },
                        "tags": [
                            {"name": "platform", "value": "kubernetes"}
                        ]
                    }
                elif platform_name == "azure":
                    return {
                        "additionalContext": {
                            "hierarchy": ["platform", "subscription", "resource_group", "resource"]
                        },
                        "tags": [
                            {"name": "platform", "value": "azure"}
                        ]
                    }
                else:
                    # Generic default
                    return {
                        "additionalContext": {
                            "hierarchy": ["platform", "resource"]
                        },
                        "tags": [
                            {"name": "platform", "value": platform_name}
                        ]
                    }
            return yaml.safe_load(content)
    except (FileNotFoundError, yaml.YAMLError) as e:
        logger.warning(f"Could not load hierarchy template for {platform_name}: {str(e)}")
        # Try to load kubernetes template as fallback
        if platform_name != "kubernetes":
            logger.info(f"Falling back to kubernetes hierarchy template")
            return load_platform_hierarchy_template("kubernetes")
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


def preprocess_template_text(template_text: str) -> str:
    """
    Pre-process template text to fix common issues before rendering.
    """
    # Fix double single quotes in Jinja2 default filter
    template_text = re.sub(r"default\(''([^']+)''\)", r"default('\1')", template_text)
    
    # Ensure conditional if blocks don't leave unbalanced YAML structure
    # This fixes the issue where '{% if condition %}' blocks might create empty or invalid structures
    template_text = re.sub(r'{%\s*if\s+([^%]+)%}\s*-\s*name:', r'{% if \1 %}- name:', template_text)
    
    # Fix issues with empty match_resource.resource.metadata.labels
    template_text = re.sub(
        r'{%\s*for\s+k,\s*v\s+in\s+match_resource\.resource\.metadata\.labels\.items\(\)\s*%}',
        r'{% if match_resource and match_resource.resource and match_resource.resource.metadata and match_resource.resource.metadata.labels %}{% for k, v in match_resource.resource.metadata.labels.items() %}', 
        template_text
    )
    template_text = re.sub(
        r'{%\s*endfor\s*%}', 
        r'{% endfor %}{% endif %}', 
        template_text,
        count=1  # Only replace the first occurrence which should match our label loop
    )
    
    # Remove subscription_id field from additionalContext if platform is kubernetes
    if "kind: ServiceLevelX" in template_text and "platform: kubernetes" in template_text:
        template_text = re.sub(r'\s+subscription_id: ".*?"', '', template_text)
    
    return template_text


def fix_yaml_indentation(yaml_text: str) -> str:
    """
    Fix YAML indentation issues, particularly for the spec section.
    Ensures properties are correctly placed under the spec section.
    """
    lines = yaml_text.split('\n')
    fixed_lines = []
    in_spec = False
    has_tags_section = False
    in_tags = False
    
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Track when we're in the spec section
        if stripped == "spec:":
            in_spec = True
            fixed_lines.append(line)
            i += 1
            continue
        
        # Check if we're in a new top-level section
        if stripped and ":" in stripped and not stripped.startswith("-") and not line.startswith(" "):
            if stripped != "spec:" and in_spec:  # We found another top-level field after spec
                in_spec = False
                in_tags = False
            fixed_lines.append(line)
            i += 1
            continue
            
        # Handle spec section contents
        if in_spec:
            # Check if we're entering or exiting tags section
            if stripped == "tags:":
                has_tags_section = True
                in_tags = True
                fixed_lines.append("  tags:")
                i += 1
                continue
            elif in_tags and stripped and not stripped.startswith("-") and ":" in stripped:
                # We're exiting tags section and entering a regular spec property
                if any(stripped.startswith(field) for field in [
                    "imageURL:", "alias:", "asMeasuredBy:", "configProvided:", 
                    "owners:", "statement:", "additionalContext:"
                ]):
                    in_tags = False
            
            # Check if the line is not indented but should be under spec
            if (stripped.startswith("imageURL:") or 
                stripped.startswith("alias:") or 
                stripped.startswith("asMeasuredBy:") or 
                stripped.startswith("owners:") or 
                stripped.startswith("statement:") or 
                stripped.startswith("configProvided:") or
                stripped.startswith("additionalContext:")):
                
                # Add proper indentation to this line
                if not line.startswith("  "):
                    fixed_lines.append("  " + stripped)
                else:
                    fixed_lines.append(line)
                i += 1
                continue
            
            # Handle tag items that might need indentation adjustment
            elif in_tags and stripped.startswith("- name:"):
                # Ensure tag items are indented correctly under tags section
                indent_level = len(line) - len(line.lstrip())
                if indent_level < 4:  # Should be at least 4 spaces (2 for spec, 2 for tags list)
                    fixed_lines.append("    " + stripped)
                else:
                    fixed_lines.append(line)
                i += 1
                continue
                    
            # Handle tag values that might need indentation adjustment
            elif in_tags and stripped.startswith("value:"):
                indent_level = len(line) - len(line.lstrip())
                if indent_level < 6:  # Should be at least 6 spaces (2 for spec, 2 for tags list, 2 for item)
                    fixed_lines.append("      " + stripped)
                else:
                    fixed_lines.append(line)
                i += 1
                continue
            
            # Handle items under configProvided
            elif stripped.startswith("- name:") and not in_tags:
                # This is an item under configProvided or another list in spec
                indent_level = len(line) - len(line.lstrip())
                if indent_level < 4:  # Should be at least 4 spaces
                    fixed_lines.append("    " + stripped)
                else:
                    fixed_lines.append(line)
                i += 1
                continue
                
            # Handle values under configProvided items
            elif stripped.startswith("value:") and not in_tags:
                indent_level = len(line) - len(line.lstrip())
                if indent_level < 6:  # Should be at least 6 spaces
                    fixed_lines.append("      " + stripped)
                else:
                    fixed_lines.append(line)
                i += 1
                continue
                
            # Handle owners list items
            elif stripped.startswith("- ") and not stripped.startswith("- name:") and not in_tags:
                indent_level = len(line) - len(line.lstrip())
                if indent_level < 4:  # Should be at least 4 spaces
                    fixed_lines.append("  " + line)
                else:
                    fixed_lines.append(line)
                i += 1
                continue
                
            else:
                fixed_lines.append(line)
                i += 1
                continue
        else:
            fixed_lines.append(line)
            i += 1
            continue
    
    return "\n".join(fixed_lines)


def fix_duplicate_sections(yaml_text: str) -> str:
    """
    Fix duplicate sections in the YAML by merging them.
    """
    try:
        # Try to parse as YAML first
        data = yaml.safe_load(yaml_text)
        if not data or not isinstance(data, dict):
            return yaml_text
            
        # Check for duplicated sections
        if "spec" in data:
            final_yaml = yaml.dump(data, sort_keys=False)
            return final_yaml
    except yaml.YAMLError:
        # If we can't parse as YAML, use regex-based approach
        pass
    
    # Text-based approach if YAML parsing fails
    sections = {}
    current_section = None
    current_content = []
    
    for line in yaml_text.split('\n'):
        stripped = line.strip()
        
        # Check if this is a top-level section
        if stripped and ":" in stripped and not stripped.startswith("-") and not line.startswith(" "):
            section_name = stripped.split(':', 1)[0]
            
            # Save the previous section
            if current_section:
                if current_section in sections:
                    sections[current_section] += current_content
                else:
                    sections[current_section] = current_content
                
            # Start a new section
            current_section = section_name
            current_content = [line]
        else:
            # Add to current section
            if current_section:
                current_content.append(line)
    
    # Add the last section
    if current_section and current_content:
        if current_section in sections:
            sections[current_section] += current_content
        else:
            sections[current_section] = current_content
    
    # Reconstruct the YAML
    result = []
    for section, content in sections.items():
        result.extend(content)
    
    return "\n".join(result)


def merge_additionalContext(yaml_text: str) -> str:
    """
    Merge multiple additionalContext sections into one.
    """
    # Attempt to parse as YAML
    try:
        data = yaml.safe_load(yaml_text)
        if not data or not isinstance(data, dict) or 'spec' not in data:
            return yaml_text
            
        # Count additionalContext sections in the loaded data
        additionalContext_count = 0
        if 'additionalContext' in data['spec']:
            additionalContext_count += 1
            
        # If only one additionalContext section, no need to merge
        if additionalContext_count <= 1:
            return yaml_text
            
        # Otherwise, fallback to regex-based approach
    except yaml.YAMLError:
        pass
    
    # Regex-based approach
    additionalContext_pattern = re.compile(r'(\s+)additionalContext:\s*\n((?:\1\s+.*\n)+)')
    matches = list(additionalContext_pattern.finditer(yaml_text))
    
    if len(matches) <= 1:
        return yaml_text
    
    # Extract and merge all additionalContext sections
    merged_context = {}
    for match in matches:
        indent = match.group(1)
        content = match.group(2)
        
        # Parse this additionalContext section
        context_yaml = f"additionalContext:\n{content}"
        try:
            context_data = yaml.safe_load(context_yaml)
            if context_data and 'additionalContext' in context_data:
                for key, value in context_data['additionalContext'].items():
                    merged_context[key] = value
        except yaml.YAMLError:
            logger.warning(f"Could not parse additionalContext section: {context_yaml}")
    
    # Replace all additionalContext sections with the merged one
    result = yaml_text
    for match in reversed(matches):  # Process in reverse to maintain correct positions
        start, end = match.span()
        indent = match.group(1)
        
        # Format the merged context
        merged_yaml = yaml.dump({'additionalContext': merged_context}, sort_keys=False, default_flow_style=False)
        # Fix indentation of the merged context
        merged_lines = merged_yaml.split('\n')
        if merged_lines and merged_lines[-1] == '':  # Remove trailing newline
            merged_lines = merged_lines[:-1]
        
        indented_context = f"{indent}additionalContext:\n"
        for line in merged_lines[1:]:  # Skip the "additionalContext:" line
            if line:
                indented_context += f"{indent}  {line}\n"
        
        # Replace the current section with the merged one
        result = result[:start] + indented_context + result[end:]
    
    return result


def fix_tag_formatting(yaml_text: str) -> str:
    """
    Ensure tags are consistently formatted under the spec section.
    """
    lines = yaml_text.split('\n')
    fixed_lines = []
    in_spec = False
    has_tags_section = False
    tag_items = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Detect spec section
        if stripped == "spec:":
            in_spec = True
            fixed_lines.append(line)
            i += 1
            continue
        
        # Detect end of spec section
        if in_spec and stripped and not stripped.startswith("-") and not line.startswith(" ") and ":" in stripped:
            if stripped != "spec:":
                in_spec = False
        
        # Collect tags in spec section
        if in_spec and (stripped.startswith("- name:") and i+1 < len(lines) and "value:" in lines[i+1]):
            # This is a tag, collect it
            tag_name = stripped.replace("- name:", "").strip().strip('"').strip("'")
            
            # Get the value line
            value_line = lines[i+1]
            tag_value = value_line.strip().replace("value:", "").strip().strip('"').strip("'")
            i += 2  # Skip both name and value lines
            
            tag_items.append((tag_name, tag_value))
            has_tags_section = True
            continue
        
        # Avoid capturing configProvided, owners, and other spec properties as tags
        if in_spec and stripped == "tags:":
            has_tags_section = True
            # Don't add this line yet - we'll add a complete tags section later
            i += 1
            continue
        
        # Skip any content that's incorrectly under tags but belongs in spec
        if in_spec and has_tags_section and stripped and not stripped.startswith("-") and ":" in stripped:
            if any(stripped.startswith(field) for field in [
                "imageURL:", "alias:", "asMeasuredBy:", "configProvided:", 
                "owners:", "statement:", "additionalContext:"
            ]):
                # This is a spec property, not a tag
                has_tags_section = False
        
        # Add lines that are not tags
        fixed_lines.append(line)
        i += 1
    
    # Find where to insert the tags section
    result = []
    inserted_tags = False
    in_spec = False
    
    for line in fixed_lines:
        stripped = line.strip()
        
        if stripped == "spec:":
            in_spec = True
            result.append(line)
            
        elif in_spec and not inserted_tags and (
            stripped.startswith("imageURL:") or 
            stripped.startswith("alias:") or
            stripped.startswith("asMeasuredBy:") or
            stripped.startswith("configProvided:") or
            stripped.startswith("owners:") or
            stripped.startswith("statement:") or
            stripped.startswith("additionalContext:")
        ):
            # Insert tags section before other spec properties
            if has_tags_section and tag_items:
                result.append("  tags:")
                for name, value in tag_items:
                    result.append(f'    - name: "{name}"')
                    result.append(f'      value: "{value}"')
            inserted_tags = True
            result.append(line)
            
        else:
            result.append(line)
    
    # If we never inserted tags but should have
    if in_spec and not inserted_tags and has_tags_section and tag_items:
        # Find the spec line and insert after it
        for i, line in enumerate(result):
            if line.strip() == "spec:":
                result.insert(i+1, "  tags:")
                for j, (name, value) in enumerate(tag_items):
                    result.insert(i+2+j*2, f'    - name: "{name}"')
                    result.insert(i+3+j*2, f'      value: "{value}"')
                break
    
    return "\n".join(result)


def create_slx_template(platform_name: str) -> str:
    """
    Create a ServiceLevelX template with properly structured spec and hierarchy based on platform.
    """
    # Define explicit platform-specific hierarchies instead of relying on templates
    platform_hierarchies = {
        "kubernetes": ["platform", "cluster", "namespace", "resource"],
        "azure": ["platform", "subscription", "resource_group", "resource"],
        # Add more platforms as needed
    }
    
    # Use the appropriate hierarchy or default if platform not recognized
    hierarchy = platform_hierarchies.get(platform_name, ["platform", "resource"])
    
    # Format the hierarchy value properly for the template
    hierarchy_str = str(hierarchy).replace("'", '"')
    
    # Define platform-specific tags
    platform_tags = {
        "kubernetes": [
            {"name": "platform", "value": "kubernetes"}
        ],
        "azure": [
            {"name": "platform", "value": "azure"}
        ]
    }
    
    # Extract tags for this platform
    tags = platform_tags.get(platform_name, [{"name": "platform", "value": platform_name}])
    
    # Build the template with platform-specific context
    template = [
        "apiVersion: runwhen.com/v1",
        "kind: ServiceLevelX",
        "metadata:",
        "  name: {{slx_name}}",
        "  labels:",
        "    {% include \"common-labels.yaml\" %}",
        "  annotations:",
        "    {% include \"common-annotations.yaml\" %}",
        "spec:",
        "  tags:"
    ]
    
    # Add platform-specific tags
    for tag in tags:
        name = tag.get('name', '')
        value = tag.get('value', '')
        template.append(f'    - name: "{name}"')
        template.append(f'      value: "{value}"')
    
    # Add conditional platform-specific tags
    if platform_name == "kubernetes":
        template.append('    - name: "cluster"')
        template.append('      value: "{{ cluster.name|default(\'unknown\') }}"')
        template.append('    - name: "namespace"')
        template.append('      value: "{{ namespace.name|default(\'unknown\') }}"')
    elif platform_name == "azure":
        template.append('    - name: "subscription"')
        template.append('      value: "{{ subscription.name|default(\'unknown\') }}"')
        template.append('    - name: "resource_group"')
        template.append('      value: "{{ resource_group.name|default(\'unknown\') }}"')
        # Only add AKS-specific tags if dealing with AKS
        template.append('    {% if cluster and cluster.cluster_type == "aks" %}')
        template.append('    - name: "cluster"')
        template.append('      value: "{{ cluster.name|default(\'unknown\') }}"')
        template.append('    - name: "namespace"')
        template.append('      value: "{{ namespace.name|default(\'unknown\') }}"')
        template.append('    {% endif %}')
    
    # Add metadata label handling safely
    if platform_name == "kubernetes":
        template.append('    {% if match_resource and match_resource.resource and match_resource.resource.metadata and match_resource.resource.metadata.labels %}')
        template.append('    {% for k, v in match_resource.resource.metadata.labels.items() %}')
        template.append('    - name: "[k8s]{{ k }}"')
        template.append('      value: "{{ v }}"')
        template.append('    {% endfor %}')
        template.append('    {% endif %}')
    
    # Add the rest of the template with platform-specific adjustments
    if platform_name == "kubernetes":
        alias = "{{namespace.name|default('Namespace')}} Health"
        statement = "Overall health for {{namespace.name|default('namespace')}} should be 1, 99% of the time."
    elif platform_name == "azure":
        alias = "{{resource_group.name|default('Resource Group')}} Resource Health"
        statement = "Overall health for {{resource_group.name|default('resource group')}} should be good, 99% of the time."
    else:
        alias = "Resource Health"
        statement = "Overall health should be good, 99% of the time."
    
    # Important: Leave a blank line here to ensure clear separation between tags and other properties
    template.append("")
    template.extend([
        "  imageURL: https://storage.googleapis.com/runwhen-nonprod-shared-images/icons/kubernetes/resources/labeled/ns.svg",
        f"  alias: {alias}",
        "  asMeasuredBy: Aggregate score based on API queries",
        "  configProvided:",
        "  - name: OBJECT_NAME",
        "    value: {{match_resource.resource.metadata.name|default('unknown')}}"
    ])
    
    # Add owners section
    template.extend([
        "  owners:",
        "  - {{workspace.owner_email}}",
        f"  statement: {statement}",
        "  additionalContext:"
    ])
    
    # Add hierarchy
    template.append(f"    hierarchy: {hierarchy_str}")
    
    # Add platform-specific context fields
    if platform_name == "kubernetes":
        template.extend([
            '    namespace: "{{match_resource.resource.metadata.name|default(\'unknown\')}}"',
            '    {% if match_resource and match_resource.resource and match_resource.resource.metadata and match_resource.resource.metadata.labels %}',
            '    labelMap: "{{match_resource.resource.metadata.labels}}"',
            '    {% endif %}',
            '    cluster: "{{ cluster.name|default(\'unknown\') }}"',
            '    context: "{{ cluster.context|default(\'unknown\') }}"'
        ])
    elif platform_name == "azure":
        template.extend([
            '    subscription_id: "{{ subscription.id|default(\'unknown\') }}"',
            '    resource_group: "{{ resource_group.name|default(\'unknown\') }}"',
            '    {% if cluster and cluster.cluster_type == "aks" %}',
            '    namespace: "{{match_resource.resource.metadata.name|default(\'unknown\')}}"',
            '    cluster: "{{ cluster.name|default(\'unknown\') }}"',
            '    {% endif %}'
        ])
    
    return "\n".join(template)


def fix_object_name_in_configprovided(yaml_text: str) -> str:
    """
    Ensure OBJECT_NAME is in configProvided, not in tags.
    Much more careful implementation to avoid removing tags.
    """
    # First check if there's an empty configProvided section
    if re.search(r'configProvided:\s*\n(?!\s+-)', yaml_text):
        # Add OBJECT_NAME to empty configProvided section
        yaml_text = re.sub(
            r'(configProvided:)\s*\n', 
            r'\1\n    - name: OBJECT_NAME\n      value: "unknown"\n', 
            yaml_text
        )
        return yaml_text
    
    # Look for OBJECT_NAME in tags - careful pattern that won't match other tags
    tag_pattern = re.compile(r'(\s+- name:\s*"OBJECT_NAME"\s*\n\s+value:\s*"([^"]*)")')
    match = tag_pattern.search(yaml_text)
    
    if match:
        # We found OBJECT_NAME in tags
        object_name_tag = match.group(1)
        object_name_value = match.group(2)
        
        # Only remove this specific tag, not all tags
        yaml_text = yaml_text.replace(object_name_tag, '')
        
        # Add to configProvided if it exists
        if "configProvided:" in yaml_text:
            # Check if configProvided is empty
            if re.search(r'configProvided:\s*\n(?!\s+-)', yaml_text):
                yaml_text = re.sub(
                    r'(configProvided:)\s*\n', 
                    f'\\1\n    - name: OBJECT_NAME\n      value: "{object_name_value}"\n', 
                    yaml_text
                )
            else:
                # Add to existing configProvided items
                yaml_text = re.sub(
                    r'(configProvided:.*?)(\n\s+[a-zA-Z])', 
                    f'\\1\n    - name: OBJECT_NAME\n      value: "{object_name_value}"\\2', 
                    yaml_text, 
                    flags=re.DOTALL
                )
        else:
            # Add configProvided section if it doesn't exist
            yaml_text = re.sub(
                r'(spec:.*?)(\n\s+owners:|\n\s+statement:|\n\s+additionalContext:)', 
                f'\\1\n  configProvided:\n    - name: OBJECT_NAME\n      value: "{object_name_value}"\\2', 
                yaml_text, 
                flags=re.DOTALL
            )
    
    return yaml_text


def ensure_tags_section(yaml_text: str) -> str:
    """
    Ensure there is a tags section with at least platform tag.
    """
    # Check if there are tags
    if "tags:" not in yaml_text or not re.search(r'tags:\s*\n\s+- name:', yaml_text):
        # Determine the platform from content
        platform = "kubernetes"
        if "subscription_id:" in yaml_text or "resource_group:" in yaml_text:
            platform = "azure"
        
        # Add a platform tag
        yaml_text = re.sub(
            r'(spec:\s*\n)', 
            f'\\1  tags:\n    - name: "platform"\n      value: "{platform}"\n', 
            yaml_text
        )
    
    return yaml_text


def render(context: Context):
    output_items: dict[str, OutputItem] = context.get_property(OUTPUT_ITEMS_PROPERTY, {})
    for output_item in output_items.values():
        logger.info(f"Rendering output item: {output_item.path}")
        
        # Skip if template_loader_func is not available
        if not output_item.template_loader_func:
            logger.warning(f"No template loader function for {output_item.path}, skipping")
            continue

        try:
            # Get the template text
            template_text = output_item.template_loader_func(output_item.template_name)
            if not template_text:
                logger.error(f"Empty template text for {output_item.template_name}")
                continue
                
            # Determine platform from template variables and template content
            platform_name = "kubernetes"  # Default
            is_azure_template = False
            
            # Check if it appears to be an Azure template based on filename or content
            if "azure" in output_item.path.lower() or "az-aks" in output_item.path.lower():
                is_azure_template = True
                logger.info(f"Template appears to be Azure-related based on path: {output_item.path}")
            
            if "azure" in template_text.lower() or "resource_group" in template_text:
                is_azure_template = True
                logger.info(f"Template appears to be Azure-related based on content")
            
            # Check resource type platform from variables
            match_resource = output_item.template_variables.get("match_resource")
            if match_resource and hasattr(match_resource, 'resource_type') and \
               hasattr(match_resource.resource_type, 'platform') and \
               hasattr(match_resource.resource_type.platform, 'name'):
                detected_platform = match_resource.resource_type.platform.name
                logger.info(f"Platform from resource type: {detected_platform}")
                # Only use the detected platform if it's not contradicting our Azure detection
                if is_azure_template and detected_platform != "azure":
                    logger.warning(f"Detected platform {detected_platform} contradicts Azure detection, using azure instead")
                    platform_name = "azure"
                else:
                    platform_name = detected_platform
            elif is_azure_template:
                platform_name = "azure"
                logger.info(f"Using azure platform based on path/content detection")
            
            logger.info(f"Final platform determination: {platform_name}")
            
            # If this is a ServiceLevelX, create a new template with proper structure for the specific platform
            if "kind: ServiceLevelX" in template_text:
                logger.info(f"Processing ServiceLevelX with platform: {platform_name}")
                template_text = create_slx_template(platform_name)
            
            # Pre-process template to fix common issues
            template_text = preprocess_template_text(template_text)
            
            try:
                output_text = render_template_string(template_text, output_item.template_variables, output_item.template_loader_func)
                logger.info(f"Template rendering successful")
            except Exception as template_error:
                logger.error(f"Template rendering failed: {str(template_error)}")
                logger.error(f"Will attempt to save the pre-rendered template instead")
                # Use the pre-rendered template as a fallback
                output_text = template_text
            
            # Post-process the rendered YAML
            try:
                # For debugging
                before_fixes = output_text
                
                # First, fix indentation issues
                output_text = fix_yaml_indentation(output_text)
                logger.debug(f"After indentation fixes, has tags: {'tags:' in output_text}")
                
                # Then fix duplicate sections
                output_text = fix_duplicate_sections(output_text)
                logger.debug(f"After duplicate section fixes, has tags: {'tags:' in output_text}")
                
                # Merge additionalContext sections
                output_text = merge_additionalContext(output_text)
                
                # Fix tag formatting
                output_text = fix_tag_formatting(output_text)
                logger.debug(f"After tag formatting, has tags: {'tags:' in output_text}")
                
                # Ensure tags section exists
                output_text = ensure_tags_section(output_text)
                logger.debug(f"After ensuring tags, has tags: {'tags:' in output_text}")
                
                # Ensure OBJECT_NAME is in configProvided, not in tags
                output_text = fix_object_name_in_configprovided(output_text)
                logger.debug(f"After fixing OBJECT_NAME, has configProvided with items: {'configProvided:' in output_text and '- name: OBJECT_NAME' in output_text}")
                
                # Correct platform value if needed
                if is_azure_template and platform_name == "azure":
                    # Ensure the platform tag is correct by replacing any platform tag with azure
                    output_text = re.sub(
                        r'(\s+)- name:\s+"platform"\s*\n\s+value:\s+"[^"]*"',
                        r'\1- name: "platform"\n\1  value: "azure"',
                        output_text
                    )
                
                # If something went wrong with our fixes and tags disappeared, restore original and try minimal fixes
                if 'tags:' not in output_text and 'tags:' in before_fixes:
                    logger.warning("Tags were lost during processing, applying minimal fixes")
                    output_text = before_fixes
                    # Only apply the most essential fixes
                    output_text = fix_yaml_indentation(output_text)
                    output_text = fix_object_name_in_configprovided(output_text)
                
                # Check if we can parse as valid YAML
                try:
                    yaml.safe_load(output_text)
                except yaml.YAMLError as e:
                    logger.error(f"YAML validation error: {str(e)}")
                    logger.error(f"Problematic YAML content:\n{output_text}")
                    # Don't raise exception - try to write the file anyway
                    # since partial output is better than no output
                    logger.warning(f"Will attempt to write file despite YAML validation errors")
            except Exception as post_process_error:
                logger.error(f"Post-processing failed: {str(post_process_error)}")
                logger.error("Exception details:", exc_info=True)
                # If post-processing fails, we'll still try to write the file
            
            # Write the output to file - do this even if there are errors
            # since partial output is better than nothing
            try:
                context.write_file(output_item.path, output_text)
                logger.info(f"Successfully wrote {output_item.path}")
            except Exception as write_error:
                logger.error(f"Failed to write {output_item.path}: {str(write_error)}")
            
        except Exception as e:
            logger.error(f"Failed to render or save {output_item.path}: {str(e)}")
            logger.error("Exception details:", exc_info=True)