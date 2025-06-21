import io
import os
import tarfile
import tempfile
import traceback
from typing import Any

from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from component import Component, Stage, Setting, Context, \
    get_active_settings, get_all_settings, get_component, apply_component_dependencies, run_components
from exceptions import WorkspaceBuilderUserException
from outputter import TarFileOutputter
from resources import Registry, REGISTRY_PROPERTY_NAME
from utils import get_version_info
from .models import InfoResult, ArchiveRunResult
from .serializers import InfoResultSerializer, ArchiveRunResultSerializer

tmpdir_value = os.getenv("TMPDIR", "/tmp")  # fallback to /tmp if TMPDIR not set

class InfoView(APIView):
    """
    Return info about the workspace builder service.
    This includes version information as well as the lists of available
    indexers, enrichers, renderers and settings.
    """
    def get(self, request: Request):
        settings = get_all_settings()
        version_info = get_version_info()
        info = InfoResult(version_info['version'], version_info['name'], Stage.INDEXER.components,
                          Stage.ENRICHER.components, Stage.RENDERER.components, settings)
        serializer = InfoResultSerializer(info)
        return Response(serializer.data)


class RunView(APIView):
    def post(self, request: Request):

        # Extract the lists of components to run.
        input_component_names = request.data.get("components", "").split(",")
        input_components = [get_component(name) for name in input_component_names]

        components: list[Component] = apply_component_dependencies(input_components)

        setting_temp_files: list[tempfile.TemporaryFile] = []
        setting_temp_dirs: list[tempfile.TemporaryDirectory] = []
        try:
            active_settings = get_active_settings(components)
            setting_values: dict[str, Any] = {}
            for setting_dependency in active_settings.values():
                setting = setting_dependency.setting
                value_string: str = request.data.get(setting.json_name)
                using_default_value = False
                if value_string is not None:
                    value = setting.convert_value(value_string)
                elif setting.default_value:
                    value = setting.default_value
                    using_default_value = True
                elif setting_dependency.required:
                    raise WorkspaceBuilderUserException(f"Required setting {setting.json_name} must be specified.")
                else:
                    value = None
                # Special handling for file-based settings
                # Write the data to a temporary file and then specify the path to the temp file
                # as the value for the setting.
                # If we're using the default value for the file-based setting, though, then that
                # means we're referencing a local file for the service, so we can just use the
                # path directly without going through the temp file mechanism.
                if value is not None:
                    if setting.type == Setting.Type.FILE and not using_default_value:
                        try:
                            # FIXME: Fix the problem with the type inferencing for "value" to address the type warning
                            tar_stream = io.BytesIO(value)
                            archive = tarfile.open(fileobj=tar_stream, mode="r")
                            setting_temp_directory = tempfile.TemporaryDirectory(dir=tmpdir_value)
                            setting_temp_dirs.append(setting_temp_directory)
                            archive.extractall(setting_temp_directory.name)
                            value = setting_temp_directory.name
                        except Exception as e:
                            # Assume that the exception was raised from trying to open the tar file,
                            # because the file is a regular file and not a tar, so in that case just
                            # treat it as a single, regular file and write it to a temporary named file.
                            # FIXME: Should catch a narrow exception.
                            setting_temp_file = tempfile.NamedTemporaryFile(mode="wb+", delete=True)
                            setting_temp_files.append(setting_temp_file)
                            setting_temp_file.write(value)
                            setting_temp_file.flush()
                            value = setting_temp_file.name
                    setting_values[setting.name] = value

            # FIXME: For now just support for the archive outputter
            # Ideally should be configurable from user to use archive vs. file hierarchy outputter
            # Although, practically speaking, with the current mode of operation where the REST
            # service is invoked via the run tool, the outputter type is purely an
            # implementation detail, so not an issue for now.
            outputter = TarFileOutputter()
            context = Context(setting_values, outputter)
            context.set_property(REGISTRY_PROPERTY_NAME, Registry())
            
            # Add configProvidedOverrides to context if present
            overrides = request.data.get("overrides", {})
            if overrides:
                context.set_property("overrides", overrides)
            
            run_components(context, components)

            outputter.close()
            archive_bytes = outputter.get_bytes()
            run_result = ArchiveRunResult("Workspace builder completed successfully.",
                                          context.warnings,
                                          archive_bytes)
        except Exception as e:
            # FIXME: This exception handling block is just for debugging. Can eventually get rid of it.
            next_exc = e
            stack_traces = []
            while next_exc:
                next_stack_trace = "\n".join(traceback.format_tb(next_exc.__traceback__))
                stack_traces.append(next_stack_trace)
                next_exc = next_exc.__cause__
            stack_trace = "\nCaused by:\n\n".join(stack_traces)
            print(stack_trace)
            raise e
        finally:
            for setting_temp_file in setting_temp_files:
                setting_temp_file.close()
            for setting_temp_dir in setting_temp_dirs:
                setting_temp_dir.cleanup()

        serializer = ArchiveRunResultSerializer(run_result)
        return Response(serializer.data)
