"""
Attach SLXs with RunWhen's kubernetes deployment triage and namespace triage codebundles
depending on the lod property.

lod 0: Skip
lod 1: Attach namespace triage
lod >1: Attach deployment triage to each deployment, http-ok to each ingress (?)

If there is no RunWhen workspace currently attached to the Kubernetes cluster, this simply
searches for the first RunWhen workspace by ID and attaches it, then attaches all subsequent
SLXs to that Workspace.  (It assumes the runwhen_workspace enricher or equivalent has already run.)
"""
from neomodel import Traversal

import models

from component import Context, ComponentDependency

# The triage namespace codebundle currently requires a kubeconfig context name, which is
# probably not available when this code is running.  This is a placeholder to figure out
# what to do next.
CONTEXT_PLACEHOLDER="default"
# See above
DISTRIBUTION="gke"

# Variables that are used to initialize/configure the component instance
DOCUMENTATION = "Configure SLXs for RunWhen's Kubernetes deployment and namespace triage code bundles"

DEPENDENCIES = (
    ComponentDependency("indexer", "kubeapi"),
)


def enrich(context: Context):
    cluster_models = models.KubernetesCluster.nodes.all()
    workspaces = models.RunWhenWorkspace.nodes.all()
    if len(workspaces) == 0:
        raise AssertionError("Expected at least one models.RunWhenWorkspace to exist in the DB, but didn't find any... did the runwhen_workspace enricher run?")

    # FIXME: This seems weird/wrong to me (RobV)
    # Seems like you should look up the workspace that was specified as the (default) workspace and use that?
    # Although, again, just more complexity that's introduced from trying to save stuff in the db
    # I guess the way this would work currently is if we require that the user restart the container for
    # every run and not have it configured
    default_workspace_model = workspaces[0]

    for cluster_model in cluster_models:
        # TODO - figure out if the K8s cluster has an alt RW workspace attached
        # TODO: I (RobV) don't know what this means? Check with Kyle.
        workspace_model = default_workspace_model
        add_cluster_health_slxs(cluster_model, workspace_model)
        namespace_models = cluster_model.namespaces.all()
        for namespace_model in namespace_models:
            # if LOD is unspecified, None or 0, skip:
            if not hasattr(namespace_model, "lod") or namespace_model.lod == None or namespace_model.lod == 0:
                continue

            # if LOD is 1 and there is no Slx already attached
            # t = Traversal(namespace_model, 'namespaceSlx', dict(node_class=models.RunWhenSlx))
            # namespace_slx_models = t.all()
            # if namespace_model.lod == 1 and len(namespace_slx_models) > 0:
            #     continue

            # if LOD is 1, get or create an slx with a triage namespace codebundle
            if namespace_model.lod == 1:
                add_namespace_triage_slx(namespace_model, workspace_model)

            if namespace_model.lod > 1:
                resource_models = namespace_model.resources.all()
                # this list is going to be a list of models with types
                # including models.KubernetesDeployment, models.KubernetesService, models.KubernetesIngress,
                # etc.
                for resource_model in resource_models:
                    if isinstance(resource_model, models.KubernetesDeployment):
                        add_deployment_triage_slx(resource_model, workspace_model)



def add_cluster_health_slxs(cluster_model, workspace_model):
    """ Adds RunWhenSlxs to prodgraph as a placeholder for basic cluster health - platform, cpu, mem
    """
    slx_props = {
        "short_name": f"{cluster_model.name}-platform",
        "alias": f"{cluster_model.name} Platform Health",
        "owner_email": "kyle.forster@runwhen.com",
        "statement": f"Default health SLI/SLO for {cluster_model.name}",
        "as_measured_by": f"Aggregate score based on Kubernetes API Server queries",
        "icon": "AnalysisL3",
        # TODO - select default SLI and SLO... maybe None is OK?
        # sli_description = StringProperty(required=False)
        # sli_codebundle_repo_url = StringProperty(required=False)
        # sli_codebundle_path_to_robot = StringProperty(required=False)
        # sli_codebundle_ref = StringProperty(required=False)
        # sli_config_provided = JSONProperty(required=False)   # Should be a map of name:value
        # slo_objective = FloatProperty(required=False)   # Should be a float [0,1]
        # slo_threshold = FloatProperty(required=False)   # Should be a Number
        # slo_operand =  StringProperty(required=False)  # Should be lt, gt, eq or neq
    }
    platform_health_slx_model = models.RunWhenSlx.create_or_update(slx_props, relationship=cluster_model.slxs)[0]
    workspace_model.slxs.connect(platform_health_slx_model)
    add_slx_to_group(workspace_model=workspace_model, 
                     group_name = f"{cluster_model.name} Platform", 
                     slx_name = platform_health_slx_model.short_name)

    slx_props = {
        "short_name": f"{cluster_model.name}-cpu",
        "alias": f"{cluster_model.name} CPU Pressure",
        "owner_email": "kyle.forster@runwhen.com",
        "statement": f"Default health SLI/SLO for {cluster_model.name} CPU pressure",
        "as_measured_by": f"Prometheus Queries",
        "icon": "Compute",
        # TODO - select default SLI and SLO... maybe None is OK?
        # sli_description = StringProperty(required=False)
        # sli_codebundle_repo_url = StringProperty(required=False)
        # sli_codebundle_path_to_robot = StringProperty(required=False)
        # sli_codebundle_ref = StringProperty(required=False)
        # sli_config_provided = JSONProperty(required=False)   # Should be a map of name:value
        # slo_objective = FloatProperty(required=False)   # Should be a float [0,1]
        # slo_threshold = FloatProperty(required=False)   # Should be a Number
        # slo_operand =  StringProperty(required=False)  # Should be lt, gt, eq or neq
    }
    cluster_cpu_slx_model = models.RunWhenSlx.create_or_update(slx_props, relationship=cluster_model.slxs)[0]
    workspace_model.slxs.connect(cluster_cpu_slx_model)
    add_slx_to_group(workspace_model=workspace_model, 
                     group_name = f"{cluster_model.name} Infrastructure", 
                     slx_name = cluster_cpu_slx_model.short_name)

    slx_props = {
        "short_name": f"{cluster_model.name}-mem",
        "alias": f"{cluster_model.name} Memory Pressure",
        "owner_email": "kyle.forster@runwhen.com",
        "statement": f"Default health SLI/SLO for {cluster_model.name} Memory pressure",
        "as_measured_by": f"Prometheus Queries",
        "icon": "Memory",
        # TODO - select default SLI and SLO... maybe None is OK?
        # sli_description = StringProperty(required=False)
        # sli_codebundle_repo_url = StringProperty(required=False)
        # sli_codebundle_path_to_robot = StringProperty(required=False)
        # sli_codebundle_ref = StringProperty(required=False)
        # sli_config_provided = JSONProperty(required=False)   # Should be a map of name:value
        # slo_objective = FloatProperty(required=False)   # Should be a float [0,1]
        # slo_threshold = FloatProperty(required=False)   # Should be a Number
        # slo_operand =  StringProperty(required=False)  # Should be lt, gt, eq or neq
    }
    cluster_mem_slx_model = models.RunWhenSlx.create_or_update(slx_props, relationship=cluster_model.slxs)[0]
    workspace_model.slxs.connect(cluster_mem_slx_model)
    add_slx_to_group(workspace_model=workspace_model, 
                     group_name = f"{cluster_model.name} Infrastructure",
                     slx_name = cluster_mem_slx_model.short_name)

    slx_props = {
        "short_name": f"{cluster_model.name}-disk",
        "alias": f"{cluster_model.name} Disk Pressure",
        "owner_email": "kyle.forster@runwhen.com",
        "statement": f"Default health SLI/SLO for {cluster_model.name} Disk pressure",
        "as_measured_by": f"Prometheus Queries",
        "icon": "Storage",
        # TODO - select default SLI and SLO... maybe None is OK?
        # sli_description = StringProperty(required=False)
        # sli_codebundle_repo_url = StringProperty(required=False)
        # sli_codebundle_path_to_robot = StringProperty(required=False)
        # sli_codebundle_ref = StringProperty(required=False)
        # sli_config_provided = JSONProperty(required=False)   # Should be a map of name:value
        # slo_objective = FloatProperty(required=False)   # Should be a float [0,1]
        # slo_threshold = FloatProperty(required=False)   # Should be a Number
        # slo_operand =  StringProperty(required=False)  # Should be lt, gt, eq or neq
    }
    cluster_disk_slx_model = models.RunWhenSlx.create_or_update(slx_props, relationship=cluster_model.slxs)[0]
    workspace_model.slxs.connect(cluster_disk_slx_model)
    add_slx_to_group(workspace_model=workspace_model, 
                     group_name = f"{cluster_model.name} Infrastructure",
                     slx_name = cluster_disk_slx_model.short_name)


def add_namespace_triage_slx(namespace_model, workspace_model, workspace_owner_email):
    """ Adds a RunWhenSlx to prodgraph with a basic namespace triage codebundle, attaching
    it to the given workspace_model
    """
    slx_props = {
        "short_name": f"{namespace_model.name}",
        "alias": f"Triage {namespace_model.name}",
        "owner_email": "kyle.forster@runwhen.com",
        "statement": f"Default health check and triage for {namespace_model.name}",
        "as_measured_by": f"Aggregate score based on Kubernetes API Server queries",
        "icon": "Cloud",
        # TODO - select default SLI and SLO... maybe None is OK?
        # sli_description = StringProperty(required=False)
        # sli_codebundle_repo_url = StringProperty(required=False)
        # sli_codebundle_path_to_robot = StringProperty(required=False)
        # sli_codebundle_ref = StringProperty(required=False)
        # sli_config_provided = JSONProperty(required=False)   # Should be a map of name:value
        # slo_objective = FloatProperty(required=False)   # Should be a float [0,1]
        # slo_threshold = FloatProperty(required=False)   # Should be a Number
        # slo_operand =  StringProperty(required=False)  # Should be lt, gt, eq or neq
        "taskset_description": f"Default triage checklist for {namespace_model.name}",
        "taskset_codebundle_repo_url": "https://git.dev.project-468.com/468-platform/rw-public-codecollection",
        "taskset_codebundle_path_to_robot": "codebundles/k8s-troubleshoot-namespace/runbook.robot",
        "taskset_codebundle_ref": "v0.0.10",
        "taskset_config_provided": {
            "NAMESPACE": namespace_model.name,
            "CONTEXT": CONTEXT_PLACEHOLDER,
            "DISTRIBUTION" : DISTRIBUTION,
        }
    }
    namespace_triage_slx_model = models.RunWhenSlx.create_or_update(slx_props, relationship=namespace_model.slxs)[0]
    workspace_model.slxs.connect(namespace_triage_slx_model)
    add_slx_to_group(workspace_model=workspace_model, 
                     group_name = f"{namespace_model.cluster.name}-other", 
                     slx_name = namespace_triage_slx_model.short_name)


def add_deployment_triage_slx(deployment_model, workspace_model):
    """ Adds a RunWhenSlx to prodgraph with a basic deployment triage codebundle
    """
    slx_props = {
        "short_name": f"dep-{deployment_model.name}",
        "alias": f"{deployment_model.name}",
        "owner_email": "kyle.forster@runwhen.com",
        "statement": f"Default health check and triage for {deployment_model.name}",
        "as_measured_by": f"Aggregate score based on Kubernetes API Server queries",
        "icon": "Routine",
        # TODO - select default SLI and SLO... maybe None is OK?
        # sli_description = StringProperty(required=False)
        # sli_codebundle_repo_url = StringProperty(required=False)
        # sli_codebundle_path_to_robot = StringProperty(required=False)
        # sli_codebundle_ref = StringProperty(required=False)
        # sli_config_provided = JSONProperty(required=False)   # Should be a map of name:value
        # slo_objective = FloatProperty(required=False)   # Should be a float [0,1]
        # slo_threshold = FloatProperty(required=False)   # Should be a Number
        # slo_operand =  StringProperty(required=False)  # Should be lt, gt, eq or neq
        "taskset_description": f"Default triage checklist for {deployment_model.name}",
        "taskset_codebundle_repo_url": "https://github.com/runwhen-contrib/rw-public-codecollection",
        "taskset_codebundle_path_to_robot": "codebundles/k8s-troubleshoot-deployment/runbook.robot",
        "taskset_codebundle_ref": "main",
        "taskset_config_provided": {
            "NAMESPACE": deployment_model.namespace_name,
            "CONTEXT": CONTEXT_PLACEHOLDER,
            "DISTRIBUTION" : DISTRIBUTION,
            "NAME":deployment_model.name,
            "LABELS": "",
        }
    }
    deployment_triage_slx_model = models.RunWhenSlx.create_or_update(slx_props, relationship=deployment_model.slxs)[0]
    workspace_model.slxs.connect(deployment_triage_slx_model)
    add_slx_to_group(workspace_model=workspace_model, 
                     group_name = deployment_model.namespace_name,
                     slx_name = deployment_triage_slx_model.short_name)


def add_slx_to_group(workspace_model, group_name, slx_name):
    """Adds this slx to the workspace slx groups"""
    # NOTE - I couldn't decide if it was worth modeling slx groups as nodes rather than simply
    # a map of strings, so wrapping it here for later.  There is no protection here
    # re: the slx existing in multiple groups
    slx_groups = workspace_model.slx_groups
    if not slx_groups:
        slx_groups = []

    slx_group = next((sg for sg in slx_groups if sg['name'] == group_name), None)
    if slx_group:
        if slx_name not in slx_group['slxs']:
            slx_group['slxs'].append(slx_name)
    else:
        slx_group = {'name': group_name, 'slxs': [slx_name,], 'dependsOn': [] }
        slx_groups.append(slx_group)
    workspace_model.slx_groups = slx_groups
    workspace_model.save()