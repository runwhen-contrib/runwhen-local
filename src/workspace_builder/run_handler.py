"""Core /run endpoint logic shared by the REST server."""

from __future__ import annotations

import io
import os
import tarfile
import tempfile
import traceback
from typing import Any

from component import (
    Component,
    Context,
    Setting,
    apply_component_dependencies,
    get_active_settings,
    get_component,
    run_components,
)
from exceptions import WorkspaceBuilderUserException
from outputter import TarFileOutputter
from resources import REGISTRY_PROPERTY_NAME, Registry

from .models import ArchiveRunResult

_TMPDIR = os.getenv("TMPDIR", "/tmp")


def _parse_component_names(components_data: Any) -> list[str]:
    if isinstance(components_data, list):
        return [str(name).strip() for name in components_data if str(name).strip()]
    if isinstance(components_data, str):
        return [name.strip() for name in components_data.split(",") if name.strip()]
    return []


def execute_run(request_data: dict[str, Any]) -> ArchiveRunResult:
    """Run the workspace-builder pipeline for a JSON request body."""
    try:
        from .health import get_health_tracker

        health_tracker = get_health_tracker()
    except Exception as exc:
        print(f"Warning: Could not initialize health_tracker: {exc}")
        health_tracker = None

    input_component_names = _parse_component_names(request_data.get("components", ""))
    input_components = [get_component(name) for name in input_component_names]
    components: list[Component] = apply_component_dependencies(input_components)

    if health_tracker:
        try:
            health_tracker.start_run(components)
        except Exception as health_error:
            print(f"Warning: Health tracker start_run failed: {health_error}")

    setting_temp_files: list[tempfile._TemporaryFileWrapper] = []
    setting_temp_dirs: list[tempfile.TemporaryDirectory] = []

    try:
        active_settings = get_active_settings(components)
        setting_values: dict[str, Any] = {}

        for setting_dependency in active_settings.values():
            setting = setting_dependency.setting
            value_string = request_data.get(setting.json_name)
            using_default_value = False

            if value_string is not None:
                value = setting.convert_value(value_string)
            elif setting.default_value:
                value = setting.default_value
                using_default_value = True
            elif setting_dependency.required:
                raise WorkspaceBuilderUserException(
                    f"Required setting {setting.json_name} must be specified."
                )
            else:
                value = None

            if value is not None:
                if setting.type == Setting.Type.FILE and not using_default_value:
                    try:
                        tar_stream = io.BytesIO(value)
                        archive = tarfile.open(fileobj=tar_stream, mode="r")
                        setting_temp_directory = tempfile.TemporaryDirectory(dir=_TMPDIR)
                        setting_temp_dirs.append(setting_temp_directory)
                        archive.extractall(setting_temp_directory.name)
                        value = setting_temp_directory.name
                    except Exception:
                        setting_temp_file = tempfile.NamedTemporaryFile(mode="wb+", delete=True)
                        setting_temp_files.append(setting_temp_file)
                        setting_temp_file.write(value)
                        setting_temp_file.flush()
                        value = setting_temp_file.name
                setting_values[setting.name] = value

        outputter = TarFileOutputter()
        context = Context(setting_values, outputter)
        context.set_property(REGISTRY_PROPERTY_NAME, Registry())

        overrides = request_data.get("overrides", {})
        if overrides:
            context.set_property("overrides", overrides)

        run_components(context, components)
        outputter.close()
        archive_bytes = outputter.get_bytes()

        slx_count = None
        try:
            slxs = context.get_property("SLXS")
            if slxs:
                slx_count = len(slxs)
        except Exception:
            pass

        if health_tracker:
            try:
                health_tracker.complete_run(warnings=context.warnings, slx_count=slx_count)
            except Exception as health_error:
                print(f"Warning: Health tracker complete_run failed: {health_error}")

        return ArchiveRunResult(
            "Workspace builder completed successfully.",
            context.warnings,
            archive_bytes,
        )

    except Exception as exc:
        full_stacktrace = traceback.format_exc()
        if health_tracker:
            try:
                health_tracker.fail_run(exc, full_stacktrace)
            except Exception as health_error:
                print(f"Warning: Health tracker fail_run failed: {health_error}")
        print(full_stacktrace)
        raise

    finally:
        for setting_temp_file in setting_temp_files:
            setting_temp_file.close()
        for setting_temp_dir in setting_temp_dirs:
            setting_temp_dir.cleanup()
