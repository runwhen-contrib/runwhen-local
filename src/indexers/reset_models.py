from component import Context
import logging
import models

logger = logging.getLogger(__name__)

DOCUMENTATION = "Clear the model data"


def index(component_context: Context):
    logger.info("Resetting neo4j models")
    models.reset_neo4j_models()
