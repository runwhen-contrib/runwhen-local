import logging
import os
from typing import Any

from jinja2.loaders import FileSystemLoader
from jinja2.sandbox import SandboxedEnvironment
from jinja2.loaders import BaseLoader, ChoiceLoader
from jinja2.exceptions import TemplateNotFound, TemplateError, UndefinedError
from jinja2 import Undefined

from exceptions import WorkspaceBuilderException


class CustomUndefined(Undefined):
    def __str__(self):
        # Log the missing variable or attribute
        missing_var = self._undefined_name
        if self._undefined_obj is not None:
            # This is an attribute error
            logging.warning(f"Undefined attribute '{missing_var}' on object {self._undefined_obj}")
        else:
            # This is a name error
            logging.warning(f"Undefined variable '{missing_var}'")
        return f"undefined_{missing_var}"

    def __getattr__(self, name):
        if name == '_undefined_name':
            return self._undefined_name
        logging.warning(f"Attempted to access attribute '{name}' on undefined variable '{self._undefined_name}'")
        return self.__class__(f"{self._undefined_name}.{name}")


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


def render_template_string(template_string: str, template_variables: dict[str, Any], template_loader_func=None) -> str:
    try:
        # Configure loaders to support includes
        loaders = [FileSystemLoader("templates")]
        if template_loader_func:
            loaders.insert(0, CustomTemplateLoader(template_loader_func))
        
        # Create environment with loaders to support includes
        env = SandboxedEnvironment(
            loader=ChoiceLoader(loaders),
            trim_blocks=True, 
            lstrip_blocks=True, 
            undefined=CustomUndefined
        )
        
        result = env.from_string(template_string).render(**template_variables)
        return result
    except UndefinedError as e:
        # Handle undefined variables/attributes specifically
        message = f"Template rendering failed due to undefined variable: {str(e)}\n" \
                 f"Template string: {template_string}\n" \
                 f"Template variables: {template_variables}"
        raise WorkspaceBuilderException(message) from e
    except TemplateNotFound as e:
        # This could have come from loading the top-level template or another
        # template that is included by the top-level template.
        missing_template_file_name = e.name
        message = f"Error opening template file: {missing_template_file_name}"
        raise WorkspaceBuilderException(message) from e
    except TemplateError as e:
        message = (f"Error processing template content:\n"
                  f"Error: {str(e)}\n"
                  f"Template string: {template_string}\n"
                  f"Template variables: {template_variables}")
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
        env = SandboxedEnvironment(loader=ChoiceLoader(loaders), trim_blocks=True, lstrip_blocks=True, undefined=CustomUndefined)
        template = env.get_template(template_file_name)
        return template.render(**template_variables)
    except UndefinedError as e:
        # Handle undefined variables/attributes specifically
        message = f"Template rendering failed due to undefined variable: {str(e)}\n" \
                 f"Template file: {template_file_name}\n" \
                 f"Template variables: {template_variables}"
        raise WorkspaceBuilderException(message) from e
    except TemplateNotFound as e:
        # This could have come from loading the top-level template or another
        # template that is included by the top-level template.
        missing_template_file_name = e.name
        parent_template_message = f"; accessed from {template_file_name}" \
            if missing_template_file_name != template_file_name else ""
        message = f"Error opening template file: {missing_template_file_name}{parent_template_message}"
        raise WorkspaceBuilderException(message) from e
    except TemplateError as e:
        message = (f"Error processing template content:\n"
                  f"Error: {str(e)}\n"
                  f"Template file: {template_file_name}\n"
                  f"Template variables: {template_variables}")
        raise WorkspaceBuilderException(message) from e
