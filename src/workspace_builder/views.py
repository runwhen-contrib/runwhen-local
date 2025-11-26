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
        # Import and use health tracker
        try:
            from .health import get_health_tracker
            health_tracker = get_health_tracker()
        except Exception as e:
            print(f"Warning: Could not initialize health_tracker: {e}")
            health_tracker = None

        # Extract the lists of components to run.
        components_data = request.data.get("components", "")
        if isinstance(components_data, list):
            # Components provided as a list
            input_component_names = components_data
        elif isinstance(components_data, str):
            # Components provided as a comma-separated string
            input_component_names = components_data.split(",") if components_data else []
        else:
            input_component_names = []
        
        input_components = [get_component(name) for name in input_component_names if name.strip()]

        components: list[Component] = apply_component_dependencies(input_components)
        
        # Track the run start (non-blocking, won't interfere with main workflow)
        if health_tracker:
            try:
                health_tracker.start_run(components)
            except Exception as health_error:
                print(f"Warning: Health tracker start_run failed: {health_error}")

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
            
            # Count SLXs from context
            slx_count = None
            try:
                slxs = context.get_property("SLXS")
                if slxs:
                    slx_count = len(slxs)
            except Exception:
                pass
            
            # Track successful completion (non-blocking)
            if health_tracker:
                try:
                    health_tracker.complete_run(warnings=context.warnings, slx_count=slx_count)
                except Exception as health_error:
                    print(f"Warning: Health tracker complete_run failed: {health_error}")
            
            run_result = ArchiveRunResult("Workspace builder completed successfully.",
                                          context.warnings,
                                          archive_bytes)
        except Exception as e:
            # Capture full stacktrace
            full_stacktrace = traceback.format_exc()
            
            # Track failed run (non-blocking) with full stacktrace
            if health_tracker:
                try:
                    health_tracker.fail_run(e, full_stacktrace)
                except Exception as health_error:
                    print(f"Warning: Health tracker fail_run failed: {health_error}")
            
            # FIXME: This exception handling block is just for debugging. Can eventually get rid of it.
            print(full_stacktrace)
            raise e
        finally:
            for setting_temp_file in setting_temp_files:
                setting_temp_file.close()
            for setting_temp_dir in setting_temp_dirs:
                setting_temp_dir.cleanup()

        serializer = ArchiveRunResultSerializer(run_result)
        return Response(serializer.data)


class HealthView(APIView):
    """
    Health endpoint for liveness and readiness checks.
    Returns detailed health information from the HealthTracker.
    """
    def get(self, request: Request):
        from datetime import datetime, timezone
        
        try:
            from .health import get_health_tracker
            health_tracker = get_health_tracker()
            
            # Get current health info from the tracker
            health_info = health_tracker.get_health_info()
            is_healthy = health_tracker.is_healthy()
            is_ready = health_tracker.is_ready()
            
            # Build response
            response_data = {
                'status': health_info.service_status,
                'service_start_time': health_info.service_start_time,
                'uptime_seconds': health_info.uptime_seconds,
                'is_healthy': is_healthy,
                'is_ready': is_ready,
            }
            
            # Include last run info if available
            if health_info.last_run:
                last_run = health_info.last_run
                response_data['last_run'] = {
                    'start_time': last_run.start_time,
                    'end_time': last_run.end_time,
                    'status': last_run.status,
                    'error_message': last_run.error_message,
                    'stacktrace': last_run.stacktrace,
                    'warnings_count': last_run.warnings_count,
                    'parsing_errors_count': last_run.parsing_errors_count,
                    'components_run': last_run.components_run,
                    'current_stage': last_run.current_stage,
                    'current_component': last_run.current_component,
                    'slx_count': last_run.slx_count,
                    'duration_seconds': last_run.duration_seconds,
                }
            
            return Response(response_data)
        except Exception as e:
            # If health tracker fails, return a basic healthy response
            print(f"Warning: Health tracker failed: {e}")
            import traceback
            traceback.print_exc()
            return Response({
                'status': 'healthy',
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'is_healthy': True,
                'is_ready': True,
                'error': str(e)
            })
