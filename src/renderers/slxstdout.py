"""
    A debug-time renderer to print names of all workspace and slx nodes in the prodgraph
    out to stdout
"""
import logging
logger = logging.getLogger(__name__)

import models
from component import Context


DOCUMENTATION = "Debug-time renderer to print names of all workspace and slx nodes to stdout"
# Not clear that any dependencies should be specified.
# Presumably in the future there will be multiple enrichers that configure different
# types of SLXs and user may want to run with different sets of them. Presumably
# we'll always want to run the kubeapi indexer, but that should be pulled in
# transitively by whatever SLX enrichers they run with. If they don't specify any
# enrichers, then this should just not print anything. Or perhaps some message
# that no SLXs are configured and they need to run with at least one SLX enricher
# configured to see any output. Or something like that...
# DEPENDENCIES = (
#     ComponentDependency("indexer", "kubeapi")
# )
DEBUG = True

def render(context: Context):
    workspace_models = models.RunWhenWorkspace.nodes.all()
    for workspace_model in workspace_models:
        slx_models = workspace_model.slxs.all()
        for slx_model in slx_models:
            print(f"{workspace_model.name}: {slx_model.name}")