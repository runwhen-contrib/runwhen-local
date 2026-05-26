"""JSON helpers for workspace-builder REST responses (formerly DRF serializers)."""

from __future__ import annotations

from base64 import b64encode
from typing import Any

from component import Component, Setting
from outputter import DirectoryItem, FileItem, OutputItem

from .models import ArchiveRunResult, InfoResult


def _omit_empty(mapping: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in mapping.items() if v}


def _serialize_component(component: Component) -> dict[str, Any]:
    return _omit_empty(
        {
            "name": component.name,
            "documentation": component.documentation,
        }
    )


def _serialize_setting(setting: Setting) -> dict[str, Any]:
    default_value = setting.default_value
    if default_value is not None and not isinstance(default_value, (str, int, float, bool)):
        default_value = str(default_value)
    return _omit_empty(
        {
            "name": setting.name,
            "type": setting.type.value if hasattr(setting.type, "value") else str(setting.type),
            "defaultValue": default_value,
            "documentation": setting.documentation,
        }
    )


def serialize_info(info: InfoResult) -> dict[str, Any]:
    return _omit_empty(
        {
            "version": info.version,
            "description": info.description,
            "indexers": [_serialize_component(c) for c in info.indexers],
            "enrichers": [_serialize_component(c) for c in info.enrichers],
            "renderers": [_serialize_component(c) for c in info.renderers],
            "settings": [_serialize_setting(s) for s in info.settings],
        }
    )


def _serialize_file_item(item: FileItem) -> dict[str, Any]:
    return _omit_empty(
        {
            "type": item.type.value,
            "data": b64encode(item.data).decode("utf-8") if isinstance(item.data, bytes) else item.data,
        }
    )


def _serialize_directory_item(item: DirectoryItem) -> dict[str, Any]:
    children = {
        name: (
            _serialize_file_item(child)
            if child.type == OutputItem.Type.FILE
            else _serialize_directory_item(child)
        )
        for name, child in (item.children or {}).items()
    }
    return _omit_empty(
        {
            "type": item.type.value,
            "children": children,
        }
    )


def serialize_run_result(result: ArchiveRunResult) -> dict[str, Any]:
    return _omit_empty(
        {
            "message": result.message,
            "warnings": result.warnings,
            "outputType": result.output_type,
            "output": b64encode(result.output).decode("utf-8"),
        }
    )
