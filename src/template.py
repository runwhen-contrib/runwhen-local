from typing import Any

from jinja2.loaders import FileSystemLoader
from jinja2.sandbox import SandboxedEnvironment
from jinja2.loaders import BaseLoader, ChoiceLoader
from jinja2.exceptions import TemplateNotFound, TemplateError

from exceptions import WorkspaceBuilderException


class CustomTemplateLoader(BaseLoader):
    """
    A jinja2 template loader wrapper around a custom template loader function.
    """
    def __init__(self, template_loader_func):
        self.template_loader_func = template_loader_func

    def get_source(self, environment, name):
        try:
            template_text = self.template_loader_func(name)
            return template_text, None, None
        except WorkspaceBuilderException as e:
            raise TemplateNotFound(name) from e


def render_template_string(template_string: str, template_variables: dict[str, Any]) -> str:
    try:
        # FIXME: Should probably support a custom template loader here, but
        # currently this is only used for path expansion, which is unlikely
        # to require template inclusion.
        env = SandboxedEnvironment(trim_blocks=True, lstrip_blocks=True)
        result = env.from_string(template_string).render(**template_variables)
        return result
    except TemplateNotFound as e:
        # This could have come from loading the top-level template or another
        # template that is included by the top-level template.
        missing_template_file_name = e.name
        message = f"Error opening template file: {missing_template_file_name}"
        raise WorkspaceBuilderException(message) from e
    except TemplateError as e:
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


def render_template_file(template_file_name: str,
                         template_variables: dict[str, Any],
                         template_loader_func = None) -> str:
    try:
        # The environment setup code should never raise an exception,
        # but put it in the try block just to be safe...
        loaders = [FileSystemLoader("templates")]
        if template_loader_func:
            loaders.insert(0, CustomTemplateLoader(template_loader_func))
        env = SandboxedEnvironment(loader=ChoiceLoader(loaders), trim_blocks=True, lstrip_blocks=True)
        template = env.get_template(template_file_name)
        return template.render(**template_variables)
    except TemplateNotFound as e:
        # This could have come from loading the top-level template or another
        # template that is included by the top-level template.
        missing_template_file_name = e.name
        parent_template_message = f"; accessed from {template_file_name}" \
            if missing_template_file_name != template_file_name else ""
        message = f"Error opening template file: {missing_template_file_name}{parent_template_message}"
        raise WorkspaceBuilderException(message) from e
    except TemplateError as e:
        # FIXME: Reduce/eliminate code duplication in the error/exception handling
        # between here and render_template_string.
        message = (f"Error processing template content: "
                   f"template_file_name={template_file_name}; "
                   f"template_variables={template_variables}")
        # FIXME: See comment above about possibly just logging an error
        # here instead of raising the exception.
        raise WorkspaceBuilderException(message) from e
