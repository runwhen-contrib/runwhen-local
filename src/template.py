from typing import Any

from jinja2.loaders import FileSystemLoader
from jinja2.sandbox import SandboxedEnvironment

from exceptions import WorkspaceBuilderException


def render_template_string(template_string: str, template_variables: dict[str, Any]) -> str:
    try:
        env = SandboxedEnvironment(trim_blocks=True, lstrip_blocks=True)
        result = env.from_string(template_string).render(**template_variables)
        return result
    except Exception as e:
        message = (f"Error processing template content: "
                   f"template_string{template_string}; "
                   f"template_variables={template_variables}")
        # TODO: Should possibly just log an error here, but continue processing
        # the rest of the output items instead of raising an exception, so that
        # a single failure doesn't cause the entire request to fail. But
        # presumably this should only be an issue if there's a problem with
        # a gen rule or the associated template, so really should only
        # happen during development of the gen rules or of the core
        # workspace builder code, so probably not a big practical issue.
        raise WorkspaceBuilderException(message) from e


def render_template_file(template_file_name: str, template_variables: dict[str, Any]) -> str:
    try:
        loader = FileSystemLoader("templates")
        env = SandboxedEnvironment(loader=loader, trim_blocks=True, lstrip_blocks=True)
        template = env.get_template(template_file_name)
    except Exception as e:
        raise WorkspaceBuilderException(f"Error opening template file: {template_file_name}") from e

    try:
        return template.render(**template_variables)
    except Exception as e:
        message = (f"Error processing template content: "
                   f"template_file_name={template_file_name}; "
                   f"template_variables={template_variables}")
        # FIXME: See comment above about possibly just logging an error
        # here instead of raising the exception.
        raise WorkspaceBuilderException(message) from e
