import logging
import threading
from typing import Any, Callable, Optional

from jinja2.loaders import FileSystemLoader
from jinja2.sandbox import SandboxedEnvironment
from jinja2.loaders import BaseLoader, ChoiceLoader
from jinja2.exceptions import TemplateNotFound, TemplateError
from jinja2 import Undefined

from exceptions import WorkspaceBuilderException

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Environment cache: rebuild a Jinja2 SandboxEnvironment (with disk loaders +
# template bytecode caching) on every render call is wasteful — for a workspace
# with 500 output items that's 500 environment + FileSystemLoader constructions
# and 500 template re-parses from disk. We cache one environment per loader
# configuration so repeated render_template_file calls reuse the parsed
# template objects. The SandboxedEnvironment is thread-safe for read-only
# template rendering (the Jinja2 docs explicitly support this).
# ---------------------------------------------------------------------------

_env_cache: dict[Any, SandboxedEnvironment] = {}
_env_cache_lock = threading.Lock()


def _get_environment(template_loader_func: Optional[Callable] = None) -> SandboxedEnvironment:
    """Return a cached (or newly built) SandboxedEnvironment for the given
    loader configuration.

    The cache key is the ``template_loader_func`` object itself (or ``None``
    for the default ``FileSystemLoader``-only path). Different codecollections
    create distinct lambda closures (each capturing its own
    ``code_collection``), so they correctly get separate environments. The
    cache dict holds a reference to the callable, preventing premature GC.
    """
    cache_key: Any = template_loader_func  # None or the callable object
    env = _env_cache.get(cache_key)
    if env is not None:
        return env
    with _env_cache_lock:
        # Double-checked lock.
        env = _env_cache.get(cache_key)
        if env is not None:
            return env
        loaders = [FileSystemLoader("templates")]
        if template_loader_func:
            loaders.insert(0, CustomTemplateLoader(template_loader_func))
        env = SandboxedEnvironment(
            loader=ChoiceLoader(loaders),
            trim_blocks=True,
            lstrip_blocks=True,
            undefined=CustomUndefined,
            # Enable bytecode caching so compiled templates are reused across
            # calls without re-parsing the .yaml source.
            auto_reload=False,
        )
        _env_cache[cache_key] = env
        return env


class CustomUndefined(Undefined):
    def __str__(self):
        # Log the missing variable or substitute with a placeholder
        # Note: self._undefined_name gives the name of the missing variable
        missing_var_name = self._undefined_name
        logging.warning(f"Custom variable '{missing_var_name}' not defined. Substituting with placeholder.")
        return "missing_workspaceInfo_custom_variable"

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
        env = SandboxedEnvironment(trim_blocks=True, lstrip_blocks=True, undefined=CustomUndefined)
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
                   f"template_string_snippet={template_string[:100]}{'...' if len(template_string) > 100 else ''}; "
                   f"underlying_error={str(e)}; "
                   f"error_type={type(e).__name__}")
        # Add template variables only if debugging is enabled to avoid noise
        if logger.isEnabledFor(logging.DEBUG):
            message += f"; template_variables={template_variables}"
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
        env = _get_environment(template_loader_func)
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
                   f"underlying_error={str(e)}; "
                   f"error_type={type(e).__name__}")
        # Add template variables only if debugging is enabled to avoid noise
        if logger.isEnabledFor(logging.DEBUG):
            message += f"; template_variables={template_variables}"
        # FIXME: See comment above about possibly just logging an error
        # here instead of raising the exception.
        raise WorkspaceBuilderException(message) from e
