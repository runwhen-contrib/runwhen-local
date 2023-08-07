"""
Queries the prodgraph db and renders it to svg diagrams using the graphviz binary, as wrapped
by the python diagrams package.

The settings for the render are stored in the prodgraph db itself.  This currently understands
the following configuration settings:

<models.KubernetesNamespace>.lod -- if exists, a number between 0 and 4

Note - while this looked promising at first, the python diagrams package is a bit kludgy.  The syntax
is very, very specific (overloaded with and << >> operators), and it isn't obvious how to go through
data structures already built up using it and editing them after the fact.
"""
import os
import tempfile

# Import the neomodel models
import models, config

# Import the python diagramming library
import diagrams
from diagrams.k8s.network import Ingress as dIngress, Service as dService
from diagrams.k8s.group import Namespace as dNamespace
from diagrams.k8s.compute import Deployment as dDeployment, StatefulSet as dStatefulSet, DaemonSet as dDaemonSet, Job as dJob, Pod as dPod

from diagrams.custom import Custom
from urllib.request import urlretrieve
from component import Context


cloud_diagram_node_url = "https://img.icons8.com/material/96/null/dashed-cloud.png"
cloud_diagram_node_icon = "./img/dashed-cloud.png"
#urlretrieve(cloud_diagram_node_url, cloud_diagram_node_icon)


slx_diagram_node_url = "https://img.icons8.com/material/96/null/creating.png"
slx_diagram_node_icon = "./img/slx.png"
#urlretrieve(slx_diagram_node_url, slx_diagram_node_icon)


# FIXME: The stuff below looks like it possibly duplicates (or is superceded?)
# by the work that the hclod enricher is doing?
# Need to look into it some more or check with Kyle.

# LOD:
# 0: Don't render
# 1: Namespace only
# 2: Namespace and ingresses
# 3: Namespace, ingress, services
# 4: Namepsace, ingress, services, deployments

LOD = {
    0: [],
    1: [models.KubernetesNamespace],
    2: [models.KubernetesNamespace, models.KubernetesIngress],
    3: [models.KubernetesNamespace, models.KubernetesIngress, models.KubernetesService],
    4: [models.KubernetesNamespace, models.KubernetesIngress, models.KubernetesService, models.KubernetesApp]
}

DEFAULT_LOD = 1

def render_at_lod(lod, model_class):
    return model_class in LOD[lod]  

def lod_sort_index(namespace_model):
    return get_namespace_lod(namespace_model)

# def attach_slx(diagram, slx_name, namespace_name):
#     with diagrams.Cluster(slx_name):
#         slx_diagram = Custom(slx_name, slx_diagram_node_icon)
#         slx_diagram >> diagram

def get_namespace_lod(namespace_model):
    configured_lod = namespace_model.lod if hasattr(namespace_model, 'lod') else DEFAULT_LOD
    return configured_lod


DOCUMENTATION = "Generate a GraphViz SVG document of the discovered entities"

def render(context: Context):
    #output_path = os.path.join(OUTPUT_DIRECTORY, "prod-diagram")
    # Annoyingly it seems like Graphviz only supports writing to a file, not writing to
    # a stream, so we write the generated file to a temp directory and then, after it's
    # been created, take the file that it created and stream it to the outputter.
    # This is a bit inefficient in the case where the outputter is writing the files
    # to an output directory, but we're not talking about a ton of data, so it's not
    # a big issue.
    temp_dir = tempfile.TemporaryDirectory()
    try:
        # FIXME: Should eventually make this configurable from a setting
        output_file_path = "prod-diagram"
        full_output_file_path = os.path.join(temp_dir.name, output_file_path)
        d = diagrams.Diagram("Prodgraph", direction="LR", filename=full_output_file_path, graph_attr={'compound': "true"})
        d.dot.clusterrank="local"
        diagrams.setdiagram(d)
        cloud_diagram = Custom("Cloud", cloud_diagram_node_icon)
        #cloud_diagram = Cloud("ext")


        cluster_models = models.KubernetesCluster.nodes.all()
        for cluster_model in cluster_models:
            with diagrams.Cluster(cluster_model.name):
                cluster_diagram = Custom("Cluster", cloud_diagram_node_icon)
                # Sort namespaces by our target LOD as a light proxy
                namespace_models = cluster_model.namespaces.all()
                namespace_models.sort(reverse=True, key=lod_sort_index)
                for namespace_model in namespace_models:
                    lod = get_namespace_lod(namespace_model)
                    if not render_at_lod(lod, models.KubernetesNamespace):
                        continue

                    with diagrams.Cluster(namespace_model.name, graph_attr={'compound': "true"}) as ctx:
                        namespace_diagrams = {} # Map of kind/name to diagram object
                        namespace_diagram = dNamespace(namespace_model.name)

                        deployment_models = models.kubernetes_filter_by_namespace(models.KubernetesDeployment,
                                                                                namespace_name=namespace_model.name,
                                                                                cluster_name=cluster_model.name)

                        service_models = models.kubernetes_filter_by_namespace(models.KubernetesService,
                                                                                namespace_name=namespace_model.name,
                                                                                cluster_name=cluster_model.name)

                        ingress_models = models.kubernetes_filter_by_namespace(models.KubernetesIngress,
                                                                                namespace_name=namespace_model.name,
                                                                                cluster_name=cluster_model.name)





                        ####
                        # Draw ingress down
                        ####
                        # Ingresses Groups (Externally-Accessible Services)
                        if not render_at_lod(lod, models.KubernetesIngress):
                            continue
                        for ingress_model in ingress_models:
                            with diagrams.Cluster(ingress_model.name + " (external)") as ctx:
                                ingress_diagram =  namespace_diagrams.get(f"Ingress/{ingress_model.name}")
                                if not ingress_diagram: # For re-use later
                                    ingress_diagram = dIngress(ingress_model.name)
                                    namespace_diagrams[f"Ingress/{ingress_model.name}"] = ingress_diagram
                                    cloud_diagram >> ingress_diagram
                                if not render_at_lod(lod, models.KubernetesService):
                                    continue
                                for service_model in ingress_model.services.all():
                                    service_diagram = namespace_diagrams.get(f"Service/{service_model.name}")
                                    if not service_diagram:
                                        service_diagram = dService(service_model.name)
                                        namespace_diagrams[f"Service/{service_model.name}"] = service_diagram
                                    ingress_diagram >> service_diagram
                                    if not render_at_lod(lod, models.KubernetesApp):
                                        continue
                                    for deployment_model in service_model.get_connected_apps(models.KubernetesDeployment):
                                        deployment_diagram = namespace_diagrams.get(f"Deployment/{deployment_model.name}")
                                        if not deployment_diagram:
                                            deployment_diagram = dDeployment(deployment_model.name)
                                            namespace_diagrams[f"Deployment/{deployment_model.name}"] = deployment_diagram
                                        service_diagram >> deployment_diagram


                        # Service Groups with no Ingress (Internal Cluster Services)
                        if not render_at_lod(lod, models.KubernetesService):
                            continue
                        with diagrams.Cluster(namespace_model.name + " cluster services") as ctx:
                            for service_model in service_models:
                                service_diagram = namespace_diagrams.get(f"Service/{service_model.name}")
                                if service_diagram:
                                    continue
                                else:
                                    # with diagrams.Cluster(service_model.name + " service"):
                                    service_diagram = dService(service_model.name)
                                    namespace_diagrams[f"Service/{service_model.name}"] = service_diagram
                                    cluster_diagram >> service_diagram
                                    for deployment_model in service_model.get_connected_apps(models.KubernetesDeployment):
                                        deployment_diagram = namespace_diagrams.get(f"Deployment/{deployment_model.name}")
                                        if not deployment_diagram:
                                            deployment_diagram = dDeployment(deployment_model.name)
                                            namespace_diagrams[f"Deployment/{deployment_model.name}"] = deployment_diagram
                                        service_diagram >> deployment_diagram

                        # Deployments with no external interfaces (Internal)
                        if not render_at_lod(lod, models.KubernetesApp):
                            continue
                        with diagrams.Cluster(namespace_model.name + " apps"):
                            for deployment_model in deployment_models:
                                deployment_diagram = namespace_diagrams.get(f"Deployment/{deployment_model.name}")
                                if deployment_diagram:
                                    continue
                                else:
                                    deployment_diagram = dDeployment(deployment_model.name)
                                    namespace_diagrams[f"Deployment/{deployment_model.name}"] = deployment_diagram

                        ####
                        # Draw deployments up
                        ####
                        # for deployment_model in deployment_models:
                        #     deployment_diagram = dDeployment(deployment_model.name)
                        #     namespace_diagrams[f"Deployment/{deployment_model.name}"] = dDeployment(deployment_model.name)
                        #     for service_model in deployment_model.services.all():
                        #         service_diagram = namespace_diagrams.get(f"Service/{service_model.name}")
                        #         if not service_diagram:
                        #             service_diagram = dService(service_model.name)
                        #             namespace_diagrams[f"Service/{service_model.name}"] = service_diagram
                        #         service_diagram >> deployment_diagram
                        #         for ingress_model in service_model.ingress.all():
                        #             ingress_diagram = namespace_diagrams.get(f"Ingress/{ingress_model.name}")
                        #             if not ingress_diagram:
                        #                 ingress_diagram = dIngress(ingress_model.name)
                        #                 namespace_diagrams[f"Ingress/{ingress_model.name}"] = ingress_diagram
                        #             ingress_diagram >> service_diagram

                        # # Services not already drawn (i.e. not connected to Apps)
                        # for service_model in service_models:
                        #     service_diagram = namespace_diagrams.get(f"Service/{service_model.name}")
                        #     if not service_diagram:
                        #         service_diagram = dService(service_model.name)
                        #         namespace_diagrams[f"Service/{service_model.name}"] = service_diagram

                        # # Ingresses not already drawn (i.e. not connected to Services)
                        # for ingress_model in ingress_models:
                        #     ingress_diagram = namespace_diagrams.get(f"Ingress/{ingress_model.name}")
                        #     if not ingress_diagram:
                        #         ingress_diagram = dIngress(ingress_model.name)
                        #         namespace_diagrams[f"Ingress/{ingress_model.name}"] = ingress_diagram


                        # # Ingresses
                        # for ingress_model in ingress_models:
                        #     ingress_diagram = dIngress(ingress_model.name)
                        #     service_diagrams = []
                        #     for service_model in ingress_model.services.all():
                        #         service_diagram = namespace_diagrams.get(f"Service/{service_model.name}")
                        #         if not service_diagram:
                        #             service_diagram = dService(service_model.name)
                        #             namespace_diagrams[f"Service/{service_model.name}"] = service_diagram

                        #         service_diagrams.append(dService(service_model.name))
                        #     ingress_diagram >> service_diagrams

                        # # Services with no ingresses
                        # service_models = models.kubernetes_filter_by_namespace(models.KubernetesService,
                        #                                                            namespace_name=namespace_model.name,
                        #                                                            cluster_name=cluster_model.name)
                        # for service_model in service_models:
                        #     if len(service_model.ingress.all()) != 0: # Already processed those with an ingress
                        #         continue
                        #     service_diagram = dService(service_model.name)


        # Fiddle with these directly
        d.dot = d.dot.unflatten(fanout=True, stagger=3, chain=6)
        d.dot.engine = "dot"
    #    d.dot.view()
        d.dot.render(format="png", view=False, quiet=True)
        with open(full_output_file_path, "rb") as f:
            data = f.read()
            context.write_file(output_file_path, data)
    finally:
        temp_dir.cleanup()

