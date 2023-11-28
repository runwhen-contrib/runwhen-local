import os
import logging
from typing import Any, Callable, Optional

from component import Context, SettingDependency, WORKSPACE_NAME_SETTING, \
    DEFAULT_LOCATION_SETTING, WORKSPACE_OUTPUT_PATH_SETTING
from template import render_template_file

logger = logging.getLogger(__name__)

# Check for the environment variable and set the log level
if os.environ.get('DEBUG_LOGGING') == 'true':
    logger.setLevel(logging.DEBUG)
else:
    logger.setLevel(logging.INFO)



DOCUMENTATION = "Render templated output items"

SETTINGS = (
    SettingDependency(DEFAULT_LOCATION_SETTING, True),
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

def render(context: Context):
    output_items: dict[str, OutputItem] = context.get_property(OUTPUT_ITEMS_PROPERTY, [])
    for output_item in output_items.values():
        logger.info(f"Rendering output item: {output_item.path}")
        output_text = render_template_file(output_item.template_name,
                                           output_item.template_variables,
                                           output_item.template_loader_func)
        context.write_file(output_item.path, output_text)
