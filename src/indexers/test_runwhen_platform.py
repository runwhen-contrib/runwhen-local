"""Tests for the runwhen platform indexer and platform handler."""

from __future__ import annotations

import os
import sys
from unittest import TestCase
from unittest.mock import MagicMock

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from enrichers.runwhen_platform import (  # noqa: E402
    RUNWHEN_PLATFORM,
    WORKSPACE_RESOURCE_TYPE,
    RunWhenPlatformHandler,
)
from indexers import runwhen_platform  # noqa: E402
from resources import REGISTRY_PROPERTY_NAME, Registry, ResourceTypeSpec  # noqa: E402


class RunWhenPlatformIndexerTests(TestCase):
    def test_index_adds_workspace_resource(self) -> None:
        registry = Registry()
        context = MagicMock()
        context.get_property.return_value = registry

        def _setting(name: str):
            values = {
                "WORKSPACE_NAME": "demo-workspace",
                "WORKSPACE_OWNER_EMAIL": "ops@example.com",
                "LOCATION_ID": "loc-123",
                "LOCATION_NAME": "shared-cluster",
            }
            return values.get(name)

        context.get_setting.side_effect = _setting

        runwhen_platform.index(context)

        resource_type = registry.lookup_resource_type(RUNWHEN_PLATFORM, WORKSPACE_RESOURCE_TYPE)
        assert resource_type is not None
        assert len(resource_type.instances) == 1
        resource = next(iter(resource_type.instances.values()))
        assert resource.name == "demo-workspace"
        assert resource.qualified_name == "demo-workspace"
        assert resource.owner_email == "ops@example.com"


class RunWhenPlatformHandlerTests(TestCase):
    def setUp(self) -> None:
        self.handler = RunWhenPlatformHandler()
        self.registry = Registry()
        self.registry.add_resource(
            RUNWHEN_PLATFORM,
            WORKSPACE_RESOURCE_TYPE,
            "demo-workspace",
            "demo-workspace",
            {"owner_email": "ops@example.com"},
        )
        self.context = MagicMock()
        self.context.get_property.return_value = self.registry

    def test_get_resources_returns_workspace_instance(self) -> None:
        spec = ResourceTypeSpec.construct_from_config("workspace", RUNWHEN_PLATFORM)
        resources = list(self.handler.get_resources(spec, self.context))
        assert len(resources) == 1
        assert resources[0].name == "demo-workspace"

    def test_get_resource_qualifier_value_workspace(self) -> None:
        spec = ResourceTypeSpec.construct_from_config("workspace", RUNWHEN_PLATFORM)
        resource = list(self.handler.get_resources(spec, self.context))[0]
        assert self.handler.get_resource_qualifier_value(resource, "workspace") == "demo-workspace"
        assert self.handler.get_resource_property_values(resource, "name") == ["demo-workspace"]
