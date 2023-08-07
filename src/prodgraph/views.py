from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from .models import InfoResult, ArchiveRunResult
from component import Component, Stage, Setting, Context, \
    get_active_settings, get_all_settings, get_component, apply_component_dependencies
from .serializers import InfoResultSerializer, ArchiveRunResultSerializer
from exceptions import ProdGraphUserException
from models import set_neomodel_credentials

import io
import tarfile
import tempfile
from typing import Any
from outputter import TarFileOutputter
from utils import get_version_info

class InfoView(APIView):
    """
    Return info about the onboarding service.
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
                if value_string != None:
                    value = setting.convert_value_string(value_string)
                elif setting.default_value:
                    value = setting.default_value
                    using_default_value = True
                elif setting_dependency.required:
                    raise ProdGraphUserException(f"Required setting {setting.json_name} must be specified.")
                else:
                    value = None
                # Special handling for file-based settings
                # Write the data to a temporary file and then specify the path to the temp file
                # as the value for the setting.
                # If we're using the default value for the file-based setting, though, then that
                # means we're referencing a local file for the service, so we can just use the
                # path directly without going through the temp file mechanism.
                if value != None:
                    if setting.type == Setting.Type.FILE and not using_default_value:
                        try:
                            tar_bytes = io.BytesIO(value)
                            archive = tarfile.open(fileobj=tar_bytes, mode="r")
                            setting_temp_directory = tempfile.TemporaryDirectory()
                            setting_temp_dirs.append(setting_temp_directory)
                            archive.extractall(setting_temp_directory.name)
                            value = setting_temp_directory.name
                        except Exception as e:
                            # Assume that the exception was raised from trying to open the tar file,
                            # because the file is a regular file and not a tar, so in that case just
                            # treat it as a single, regular file and write it to a temporary named file.
                            setting_temp_file = tempfile.NamedTemporaryFile(mode="wb+", delete=True)
                            setting_temp_files.append(setting_temp_file)
                            setting_temp_file.write(value)
                            setting_temp_file.flush()
                            value = setting_temp_file.name
                    setting_values[setting.name] = value

            # FIXME: For now just support for the archive outputter
            # Ideally should be configurable from user to use archive vs. file hierarchy outputter
            outputter = TarFileOutputter()
            context = Context(setting_values, outputter)
            set_neomodel_credentials()
            # FIXME: This should call component.run_components to avoid code duplication.
            # Would need to resolve differences in how they're called, i.e. separate lists for
            # the indexers, enrichers, renders, vs. a single list.
            # (Or else should get rid of run_components).
            for component in components:
                if component.load_func:
                    component.load_func(context)
            for component in components:
                component.run_func(context)

            outputter.close()
            archive_bytes = outputter.get_bytes()
            run_result = ArchiveRunResult("Run completed successfully. Output saved as archive data.", archive_bytes)
        except Exception as e:
            # FIXME: This exception handling block is just for debugging. Can eventually get rid of it.
            raise e
        finally:
            for setting_temp_file in setting_temp_files:
                setting_temp_file.close()
            for setting_temp_dir in setting_temp_dirs:
                setting_temp_dir.cleanup()

        serializer = ArchiveRunResultSerializer(run_result)
        return Response(serializer.data)