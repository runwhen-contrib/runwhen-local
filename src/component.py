from base64 import b64decode
from enum import Enum
from functools import total_ordering
from types import ModuleType
from typing import Any, Callable, Optional, AnyStr, Union
from importlib import import_module

from outputter import Outputter
from exceptions import WorkspaceBuilderException, WorkspaceBuilderUserException, \
    WorkspaceBuilderObjectNotFoundException

class Setting:
    """
    An individual setting value that configures the operation of one or more
    components. Settings can be shared across different components (some
    shared settings are defined in this module below) or can be defined
    privately for a specific component. Components specify the settings that
    they depend upon by defining a SETTINGS variable in the module where
    the component is implemented.
    """
    class Type(Enum):
        BOOLEAN = "boolean"
        INTEGER = "integer"
        STRING = "string"
        FLOAT = "float"
        FILE = "file"
        DICT = "dict"
        LIST = "list"
        ENUM = "enum"

    name: str
    json_name: str
    type: Type
    enum_class: Enum
    default_value: Optional[Union[bool, int, float, str, dict]]
    documentation: str
    enum_class: Enum
    enum_constructor: Callable[[Any], Enum]

    def __init__(self, name: str, json_name: str, type: Type, documentation: str,
                 default_value: Optional[Union[bool, int, float, str, dict, list]] = None,
                 enum_class: Enum=None, enum_constructor=None):
        self.name = name
        self.json_name = json_name
        self.type = type
        self.default_value = default_value
        self.documentation = documentation
        self.enum_class = enum_class
        self.enum_constructor = enum_constructor

    def convert_value(self, value: Any) -> Any:
        """
        Convert the value for a setting that's specified in the input data
        into an instance of the corresponding type for the setting.
        """
        try:
            if self.type == Setting.Type.STRING:
                return value
            elif self.type == Setting.Type.INTEGER:
                return int(value)
            elif self.type == Setting.Type.FLOAT:
                return float(value)
            elif self.type == Setting.Type.BOOLEAN:
                if isinstance(value, bool):
                    return value
                if isinstance(value, str):
                    if value.lower() == "true":
                        return True
                    elif value.lower() == "false":
                        return False
                raise WorkspaceBuilderUserException(f'Expected a boolean value of "true" or "false" '
                                                    f'for the "{self.json_name} setting')
            elif self.type == Setting.Type.FILE:
                return b64decode(value)
            elif self.type == Setting.Type.DICT:
                if type(value) is not dict:
                    raise ValueError("Expected dict value for dict setting type")
                return value
            elif self.type == Setting.Type.LIST:
                if type(value) is not list:
                    raise ValueError("Expected list value for list setting type")
                return value
            elif self.type == Setting.Type.ENUM:
                if self.enum_constructor:
                    return self.enum_constructor(value)
                else:
                    try:
                        return self.enum_class[value]
                    except KeyError:
                        pass
                    try:
                        return self.enum_class(value)
                    except ValueError:
                        pass
                    # FIXME: Is this necessary or will the value already be an int
                    # i.e. is the input argument always a string?
                    return self.enum_class(int(value))
            else:
                raise WorkspaceBuilderException(f"Invalid setting type: {self.type}")
        except ValueError as e:
            # If the setting was successfully parsed/converted it will have already
            # been returned above, so if we hit here it means there was an error
            raise WorkspaceBuilderException(f"Error converting setting: {str(e)}")


class SettingDependency:
    """
    Used to specify which settings a component uses. These dependencies are used
    to construct the dict of the active/relevant settings for the components that
    are active for a particular execution of a workspace builder component pipeline.

    FIXME: Do we really need the required flag here? Could we just say that if
    a setting has a default_value then it's optional? i.e. if a setting that
    an active component depends on doesn't have a value specified in the
    input data and no default value, then that triggers an error.
    """
    setting: Setting
    required: bool

    def __init__(self, setting: Setting, required: bool):
        self.setting = setting
        self.required = required


class ComponentDependency:
    """
    Specifies a dependency that a component has on another component. The components
    that are explicitly specified in the input data are expanded with all the
    dependent components (recursively) to form the complete pipeline of components
    that are executed in a particular run.
    """
    stage_name: str
    component_name: str

    def __init__(self, stage_name: str, component_name: str):
        self.stage_name = stage_name
        self.component_name = component_name


@total_ordering
class Stage(Enum):
    """
    The different stages of component execution. Components are always
    ordered by stage in determining the execution order of a pipeline, even
    if that changes the order from the input data.
    """
    module_name: str
    run_func_name: str
    components: list["Component"]

    def __new__(cls, module_name, run_func_name):
        value = len(cls.__members__) + 1
        obj = object.__new__(cls)
        obj._value_ = value
        obj.module_name = module_name
        obj.run_func_name = run_func_name
        return obj

    def set_components(self, components: list["Component"]):
        self.components = components

    def __lt__(self, other):
        return self.value < other.value

    INDEXER = "indexers", "index"
    ENRICHER = "enrichers", "enrich"
    RENDERER = "renderers", "render"


class Component:
    """
    A component in the workspace builder execution pipeline.
    """
    name: str
    stage: Stage
    documentation: str
    settings: tuple[SettingDependency]
    dependencies: tuple[ComponentDependency]
    debug: bool
    # TODO: type annotations for load_func and run_func functions
    # run: ???

    def __init__(self, stage: Stage, component_module: ModuleType, default_component_name: str):
        # Allow the component to override using its module name as its identifier name
        self.name = getattr(component_module, "NAME", default_component_name)
        self.stage = stage
        self.documentation = getattr(component_module, "DOCUMENTATION", None)
        self.settings = getattr(component_module, "SETTINGS", tuple())
        self.dependencies = getattr(component_module, "DEPENDENCIES", tuple())
        self.load_func = getattr(component_module, "load", None)
        # FIXME: Better error handling/reporting if run funct isn't defined
        self.run_func = getattr(component_module, stage.run_func_name)
        self.debug = getattr(component_module, "DEBUG", False)


class Context:
    """
    A context is passed to every component's run function and provides access to the
    settings and abstracts the file output operations.
    """
    setting_values: dict[str, Any]
    outputter: Outputter
    properties: dict[str, Any]

    def __init__(self, setting_values: dict[str, Any], outputter: Outputter):
        self.setting_values = setting_values
        self.outputter = outputter
        self.properties = dict()

    def get_setting(self, name: str) -> Any:
        setting = all_settings.get(name)
        return self.setting_values.get(name, setting.default_value)

    def write_file(self, path: str, data: AnyStr) -> None:
        self.outputter.write_file(path, data)

    def set_property(self, name: str, value: Any) -> None:
        self.properties[name] = value

    def get_property(self, name: str, default_value: Any = None) -> Any:
        return self.properties.get(name, default_value)


all_settings: dict[str, Setting]
all_components: dict[str, Component]


def init_components():
    global all_settings, all_components
    all_settings = dict()
    all_components = dict()

    # FIXME: Would be nicer if there was some auto-discovery process
    # e.g. scan the modules in the indexers/enrichers/renderers modules and look
    # for ones that have an index/enrich/render method definition or possibly have
    # a Component abstract base class that components derive from and look for
    # subclasses. Or something like that.
    # As it stands now if there's a new component implementation then it needs to
    # be added here, which is less than ideal, although practically may not be
    # a huge deal.
    component_stages_init = (
        (Stage.INDEXER, ["kubeapi", "cloudquery"]),
        (Stage.ENRICHER, ["runwhen_default_workspace", "generation_rules"]),
        (Stage.RENDERER, ["render_output_items", "dump_resources"])
    )
    for stage, component_names in component_stages_init:
        components = list()
        for component_name in component_names:
            component_module_name = f"{stage.module_name}.{component_name}"
            component_module = import_module(component_module_name)
            component = Component(stage, component_module, component_name)
            components.append(component)
            all_components[component.name] = component
            for setting_dependency in component.settings:
                setting = setting_dependency.setting
                all_settings[setting.name] = setting
        stage.set_components(components)


def get_all_settings() -> list[Setting]:
    return list(all_settings.values())


def get_component(name: str) -> Component:
    component = all_components.get(name)
    if not component:
        raise WorkspaceBuilderObjectNotFoundException("component", name)
    return component


def apply_component_dependencies(components: list[Component]) -> list[Component]:
    """
    Generate an output component list that ensures that the components are
    sorted appropriately by stage, i.e. indexers before enrichers before renderers.
    Also evaluate the component dependencies for each input component and
    expand the output component list with any dependencies that don't exist in the
    input.

    :param components: List of components listed by the user
    :return: List of components that's sorted by stage and expanded to include
             component dependencies
    """
    # FIXME: Need to implement the handling of the component dependencies
    # Should ensure that components are ordered by stage
    # Should evaluate
    # input list.

    # Separate the specified components by stage, so we can recombine at the
    # end in the correct stage order
    separated_components: dict[Stage, list[Component]] = dict()
    for stage in Stage:
        separated_components[stage] = []
    for component in components:
        stage_components = separated_components.get(component.stage)
        stage_components.append(component)

    # FIXME: Need to handle component dependencies here!

    # Concatenate the separated lists into a single list with the correct
    # stage ordering.
    return (separated_components[Stage.INDEXER] +
            separated_components[Stage.ENRICHER] +
            separated_components[Stage.RENDERER])


def get_active_settings(components: list[Component]) -> dict[str, SettingDependency]:
    """
    Generate the list of settings that are active for the input list of active
    components. This is basically just the union of all the settings dependencies
    for all the active components.

    Note that this does not do component dependency expansion, so input component
    list here should be the one obtained after dependency expansion, not the
    original component list specified in the input data.

    :param components: list of active components
    :return: dict of active settings across all the active components
    """
    active_settings = {}
    for component in components:
        for setting_dependency in component.settings:
            setting = setting_dependency.setting
            existing_setting_dependency = active_settings.get(setting.name)
            if existing_setting_dependency:
                # If any of the components have a required dependency of this setting, then
                # we treat it as required overall for the purposes of validating that it was
                # actually specified by the user.
                if setting_dependency.required:
                    existing_setting_dependency.required = True
            else:
                active_settings[setting.name] = setting_dependency
    return active_settings


def run_components(context: Context, components: list[Component]) -> None:
    """
    Run all the components specified in the component lists. This
    assumes that the caller has correctly ordered the components such
    that the indexers are before the enrichers which are before the renderers.

    :param components: The components to run
    """
    for component in components:
        if component.load_func:
            component.load_func(context)
    for component in components:
        component.run_func(context)


# Shared/common settings that are accessed across multiple components

KUBECONFIG_SETTING = Setting("KUBECONFIG",
                             "kubeconfig",
                             Setting.Type.FILE,
                             "Location of kubeconfig file for the Kubernetes cluster to be indexed")

WORKSPACE_NAME_SETTING = Setting("WORKSPACE_NAME",
                                 "workspaceName",
                                 Setting.Type.STRING,
                                 "Workspace name")

WORKSPACE_OWNER_EMAIL_SETTING = Setting("WORKSPACE_OWNER_EMAIL",
                                        "workspaceOwnerEmail",
                                        Setting.Type.STRING,
                                        "Email address of owner of the workspace")

# Is there a reasonable default value to use for this?
# i.e. Does this need to be a required setting from the user?
# FIXME: Need a better doc string
DEFAULT_LOCATION_SETTING = Setting("DEFAULT_LOCATION",
                                   "defaultLocation",
                                   Setting.Type.STRING,
                                   "Default location")

WORKSPACE_OUTPUT_PATH_SETTING = Setting("WORKSPACE_OUTPUT_PATH",
                                        "workspaceOutputPath",
                                        Setting.Type.STRING,
                                        "Output path to where the generated RunWhen workspace files should be written",
                                        "workspaces")
