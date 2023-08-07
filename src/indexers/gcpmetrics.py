""" Index assets that we can find by querying the gcp metrics
    service (part of ops suite) and investigate the labels that
    we see on metrics that are being collected
"""


from google.cloud import monitoring_v3
import time
import models
from neomodel import config as neomodel_config

from component import Setting, SettingDependency, Context

import logging
logger = logging.getLogger(__name__)


#########
# GCP Monitoring Scan
#########

GCP_PROJECT_ID_SETTING = Setting("GCP_PROJECT_ID",
                                 "gcpProjectId",
                                 Setting.Type.STRING,
                                 "Collect/index metrics queried from the GCP metrics service")

DESCRIPTION = "Index metrics from the Google Cloud Platform"
SETTINGS = (
    # FIXME: Does this depend on any Kubernetes info, e.g. KUBE_CONFIG
    SettingDependency(GCP_PROJECT_ID_SETTING, True),
)

# Set up for GCP Monitoring
def index(context: Context):
    project_id = context.get_setting("GCP_PROJECT_ID")
    client = monitoring_v3.MetricServiceClient()
    project_name = f"projects/{project_id}"
    #
    #
    prometheus_metric_descriptors = []
    kube_metric_descriptors = []
    # # Metric Descriptors
    descriptors = []
    # with open("descriptors.txt", "w") as f:
    #     for descriptor in client.list_metric_descriptors(name=project_name):
    #         print(descriptor.type)
    #         descriptors.append(descriptor)
    #         #f.write(f"{json.dumps(descriptor)}\n")
    #         if "prometheus" in descriptor.type:
    #           prometheus_metric_descriptors.append(descriptor)
    #         if "kube" in descriptor.type:
    #           kube_metric_descriptors.append(descriptor)

    # Metric resources
    # resource_descriptors = client.list_monitored_resource_descriptors(name=project_name)
    # for descriptor in resource_descriptors:
    #     print(descriptor.type)
    # Metric Time Series With Samples, Last X Seconds
    now = time.time()
    seconds = int(now)
    x = 1200
    nanos = int((now - seconds) * 10 ** 9)
    interval = monitoring_v3.TimeInterval(
        {
            "end_time": {"seconds": seconds, "nanos": nanos},
            "start_time": {"seconds": (seconds - x), "nanos": nanos},
        }
    )

    # Scan all of the pods, building up higher level constructs
    results = client.list_time_series(
        request={
            "name": project_name,
            "filter": 'metric.type = "prometheus.googleapis.com/kube_pod_info/gauge"',
            "interval": interval,
            "view": monitoring_v3.ListTimeSeriesRequest.TimeSeriesView.FULL,
        }
    )
    # Cluster objects, indexed by name
    clusters = {}
    # Namespace objects, indexed by name
    namespaces = {}
    # Statefulset objects, indexed by name
    statefulsets = {}
    # Replicaset objects, indexed by name
    replicasets = {}
    # Daemonset objects, indexed by name
    daemonsets = {}
    pod_creators = {}
    for result in results:
        resource_labels = result.resource.labels
        metric_labels = result.metric.labels
        cluster_name = resource_labels.get("cluster")
        namespace_name = resource_labels.get("namespace")
        created_by_kind =  metric_labels.get("created_by_kind")
        created_by_name =  metric_labels.get("created_by_name")
        cluster = models.KubernetesCluster.create_or_update({'name': cluster_name})[0]
        cluster.save()
        namespace = models.KubernetesNamespace.create_or_update({'name': namespace_name}, relationship=cluster.namespaces)[0]
        # if not namespace.cluster:
        #     namespace.cluster.connect(cluster)
        # namespace.save()
        if created_by_kind == 'StatefulSet':
            statefulset = models.KubernetesStatefulSet.create_or_update({'name': created_by_name}, relationship=namespace.resources)[0]
            # statefulset.save()
        if created_by_kind == 'ReplicaSet':
            statefulset = models.KubernetesReplicaSet.create_or_update({'name': created_by_name}, relationship=namespace.resources)[0]
            # statefulset.save()
        if created_by_kind == 'DaemonSet':
            statefulset = models.KubernetesDaemonSet.create_or_update({'name': created_by_name}, relationship=namespace.resources)[0]
            # statefulset.save()
        if created_by_kind == 'Job':
            statefulset = models.KubernetesJob.create_or_update({'name': created_by_name}, relationship=namespace.resources)[0]
            # statefulset.save()
        pod_creator_names = pod_creators.get(created_by_kind)
        if not pod_creator_names:
            pod_creator_names = set()
            pod_creators[created_by_kind] = pod_creator_names
        pod_creator_names.add(created_by_name)




    # Scan deployment metrics to augment 
    results = client.list_time_series(
        request={
            "name": project_name,
            "filter": 'metric.type = "prometheus.googleapis.com/kube_deployment_labels/gauge"',
            "interval": interval,
            "view": monitoring_v3.ListTimeSeriesRequest.TimeSeriesView.FULL,
        }
    )
    for result in results:
        resource_labels = result.resource.labels
        metric_labels = result.metric.labels
        cluster_name = resource_labels.get("cluster")
        namespace_name = resource_labels.get("namespace")
        deployment_name = metric_labels.get("deployment")
        cluster = models.KubernetesCluster.create_or_update({'name': cluster_name})[0]
        # cluster.save()
        namespace = models.KubernetesNamespace.create_or_update({'name': namespace_name}, relationship=cluster.namespaces)[0]
        # if not namespace.cluster:
        #     namespace.cluster.connect(cluster)
        # namespace.save()
        deployment = models.KubernetesDeployment.create_or_update({'name': deployment_name}, relationship=namespace.resources)[0]
        # deployment.save()
        print(f"{set(result.metric.labels.keys())} {set(result.resource.labels.keys())}")

