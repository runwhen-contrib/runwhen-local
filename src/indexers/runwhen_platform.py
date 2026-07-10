"""Index RunWhen platform resources for generation-rule matching.

The ``runwhen`` platform exposes workspace-scoped resources so generation rules
can render SLXs without tying discovery to a cloud or Kubernetes object.
"""

from __future__ import annotations

import logging

from component import Context
from resources import REGISTRY_PROPERTY_NAME, Registry

logger = logging.getLogger(__name__)

DOCUMENTATION = (
    "Index RunWhen platform resources (workspace anchor) for generation rules "
    "with platform: runwhen"
)

RUNWHEN_PLATFORM = "runwhen"
WORKSPACE_RESOURCE_TYPE = "workspace"


def index(context: Context) -> None:
    workspace_name = context.get_setting("WORKSPACE_NAME")
    workspace_owner_email = context.get_setting("WORKSPACE_OWNER_EMAIL")
    location_id = context.get_setting("LOCATION_ID")
    location_name = context.get_setting("LOCATION_NAME")

    if not workspace_name:
        logger.warning("WORKSPACE_NAME not set; skipping runwhen platform indexing")
        return

    registry: Registry = context.get_property(REGISTRY_PROPERTY_NAME)
    attributes = {
        "owner_email": workspace_owner_email,
        "short_name": workspace_name,
        "location_id": location_id,
        "location_name": location_name,
        "platform": RUNWHEN_PLATFORM,
        "resource_type": WORKSPACE_RESOURCE_TYPE,
    }
    registry.add_resource(
        RUNWHEN_PLATFORM,
        WORKSPACE_RESOURCE_TYPE,
        workspace_name,
        workspace_name,
        attributes,
    )
    logger.info(
        "Indexed runwhen platform workspace resource: name=%s",
        workspace_name,
    )
