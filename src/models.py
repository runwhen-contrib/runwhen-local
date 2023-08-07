import os
from typing import Optional

from exceptions import WorkspaceBuilderException
import logging
from neomodel import db

logger = logging.getLogger(__name__)

def set_neomodel_credentials():
  """
  Set up the neomodel connection credentials.
  Neomodel stores this as per-thread state, so this needs to be called for each
  thread that's going to do neomodel calls. In the REST service context, where
  there are multiple threads servicing incoming requests, in practice it's just
  easiest to call it every time for each incoming request. I haven't timed it,
  but it doesn't seem like it's an expensive call, so I think this should be fine.
  :return:
  """
  neo4j_auth = os.getenv("NEO4J_AUTH")
  if not neo4j_auth:
    raise WorkspaceBuilderException("neo4j auth credentials must be specified in the NEO4J_AUTH environment variable")
  neo4j_user, neo4j_pass = neo4j_auth.split('/')
  # Set up the connection string for the neomdodel database
  # Note this needs to be done before other neomodel imports as they assume the db connection
  # for the thread is already live
  conn_str =  f'bolt://{neo4j_user}:{neo4j_pass}@localhost:7687'
  logger.debug(f"configuration connection to neomodel database with {conn_str}")
  from neomodel import db
  db.set_connection(conn_str)

set_neomodel_credentials()

from neomodel import RelationshipTo, RelationshipFrom, Traversal
from neomodel.contrib import SemiStructuredNode
from neomodel.properties import StringProperty, JSONProperty
from neomodel.cardinality import ZeroOrOne, ZeroOrMore, One


class Metric(SemiStructuredNode):
  # Store all resource labels
  resource_labels = JSONProperty()


class KubernetesBase(SemiStructuredNode):
  # FIXME: Played around with making the well-known fields that are extracted in
  # kubeapi_parsers.parse_resource explicit properties in the model (which would
  # presumably also make it possible to make this a StructureNode instead of a
  # SemiStructuredNode), but this was causing some deflate error from neomodel
  # (specifically with the "kind" property), so I'm backing off on this for now,
  # but should revisit.
  # uid = StringProperty()
  # kind = StringProperty()
  # FIXME: From looking at the neomodel code, I don't think "unique" is a supported parameter,
  # so I think this is just being ignored by neomodel, but need to double-check.
  name = StringProperty(required=True, unique=False)   # These are only unique in the scope of the namespace
  labels = JSONProperty()
  annotations = JSONProperty()
  # The resource field is the raw resource data, basically just a straight conversion
  # of the resource we get from the kubernetes client to a dict. This is so that
  # templates can access arbitrary (possibly nested) fields in the resource without us
  # needing any special knowledge of the structure and applicable fields for
  # each resource type. Sort of a hack, but works for now...
  resource = JSONProperty(required = False)

  def get_name(self) -> str:
    return self.name

  def get_namespace(self) -> Optional["KubernetesNamespace"]:
    # raise WorkspaceBuilderException("Resource type doesn't have an associated namespace")
    return None

  def get_cluster(self) -> Optional["KubernetesCluster"]:
    # raise WorkspaceBuilderException("Resource type doesn't have an associated cluster")
    return None

  def get_context(self) -> Optional[str]:
    # raise WorkspaceBuilderException("Resource type doesn't have an associated cluster")
    cluster = self.get_cluster()
    return cluster.context if cluster else None


class KubernetesCluster(KubernetesBase):
  context: StringProperty(required=True, unique=True)
  namespaces = RelationshipFrom('KubernetesNamespace', 'CLUSTER', cardinality=ZeroOrMore)

  def get_cluster(self) -> "KubernetesCluster":
    return self

class KubernetesNamespace(KubernetesBase):
  cluster = RelationshipTo('KubernetesCluster', 'CLUSTER', cardinality=One)
  resources = RelationshipFrom('KubernetesNamespacedResource', 'NAMESPACE_RESOURCE', cardinality=ZeroOrMore)

  def get_namespace(self) -> "KubernetesNamespace":
    return self

  def get_cluster(self) -> KubernetesCluster:
    return self.cluster.single()


class KubernetesNamespacedResource(KubernetesBase):
  namespace  = RelationshipTo('KubernetesNamespace', 'NAMESPACE_RESOURCE', cardinality=ZeroOrOne)
  namespace_name = StringProperty()

  def get_namespace(self) -> KubernetesNamespace:
    return self.namespace.single()

  def get_cluster(self) -> KubernetesCluster:
    return self.get_namespace().get_cluster()

class KubernetesIngress(KubernetesNamespacedResource):
  services  = RelationshipFrom('KubernetesService', 'INGRESS_SERVICE', cardinality=ZeroOrMore)
  paths = JSONProperty()

class KubernetesService(KubernetesNamespacedResource):
  ingress  = RelationshipTo('KubernetesIngress', 'INGRESS_SERVICE', cardinality=ZeroOrOne)
  selector = JSONProperty(required = False)
  apps = RelationshipTo('KubernetesApp', 'APP_SERVICE', cardinality=ZeroOrMore)
  def get_connected_apps(self, cls):
    return Traversal(self, cls.__name__, {'node_class': cls}).all()


class KubernetesConfigMap(KubernetesNamespacedResource):
  apps  = RelationshipFrom('KubernetesApp', 'CONFIGMAP_APP', cardinality=ZeroOrMore)

class KubernetesSecret(KubernetesNamespacedResource):
  apps  = RelationshipFrom('KubernetesApp', 'SECRET_APP', cardinality=ZeroOrMore)

class KubernetesPersistentVolumeClaim(KubernetesNamespacedResource):
  apps  = RelationshipFrom('KubernetesApp', 'PERSISTENTVOLUMECLAIM_APP', cardinality=ZeroOrMore)

class KubernetesApp(KubernetesNamespacedResource):
  config_maps = RelationshipTo('KubernetesConfigMap', 'CONFIGMAP_APP', cardinality=ZeroOrMore)
  secrets = RelationshipTo('KubernetesSecret', 'SECRET_APP', cardinality=ZeroOrMore)
  persistent_volume_claims = RelationshipTo('KubernetesPersistentVolumeClaim', 'PERSISTENTVOLUMECLAIM_APP', cardinality=ZeroOrMore)
  services = RelationshipFrom('KubernetesService', 'APP_SERVICE', cardinality=ZeroOrMore)

class KubernetesStatefulSet(KubernetesApp):
  pass

class KubernetesReplicaSet(KubernetesApp):
  pass

class KubernetesDaemonSet(KubernetesApp):
  pass

class KubernetesJob(KubernetesApp):
  pass

class KubernetesDeployment(KubernetesApp):
  pass

class KubernetesPod(KubernetesNamespacedResource):
  pass

class KubernetesCustomResource(KubernetesNamespacedResource):
  group = StringProperty(required=True, unique=False)
  version = StringProperty(required=True, unique=False)
  plural_name = StringProperty(required=True, unique=False)

class RunWhenBase(SemiStructuredNode):
  short_name = StringProperty(required=True, unique=False)  #SLX names are unique only in the scope of the workspace

  def get_name(self):
    return self.short_name

class RunWhenWorkspace(RunWhenBase):
  owner_email = StringProperty(required=True)


def reset_neo4j_models():
  model_classes = (
    KubernetesCluster,
    KubernetesNamespace,
    KubernetesIngress,
    KubernetesService,
    KubernetesConfigMap,
    KubernetesSecret,
    KubernetesPersistentVolumeClaim,
    KubernetesApp,
    KubernetesStatefulSet,
    KubernetesReplicaSet,
    KubernetesDaemonSet,
    KubernetesJob,
    KubernetesDeployment,
    KubernetesPod,
    KubernetesCustomResource,
    RunWhenWorkspace,
  )
  for model_class in model_classes:
    all_instances = model_class.nodes.all()
    for instance in all_instances:
      instance.delete()

# TODO - split these out from models and in to a queries file?

def kube_escape(s):
    """Escapes a k8s valid key to a neomodel valid key"""
    # TODO - redo this with proper regexp.  This is just for my
    # own readability ease...
    s = s.replace("_", "__")
    s = s.replace(".", "_dot_")
    s = s.replace("/", "_slash_")
    s = s.replace("-", "_dash_")
    return s

def kube_unescape(s):
    """See escape"""
    s = s.replace("_dash_", "-")
    s = s.replace("_slash_", "/")
    s = s.replace("_dot_", ".")
    s = s.replace("__", "_")
    return s

def kubernetes_filter_by_labels(cls, labels: dict, namespace_name: str, cluster_name: str):
  """
  """
  # Impl note - this would have been more elegant to take a KubernetesNamespace as an arg
  # (and likely have a more efficient query), but I couldn't figure out how to query based on 
  # the neomodel KubernetesNamespace node relationship, or neomodel id of the KubernetesNamespace node.
  # The problematic case is 2 namespaces, each in different clusters, that share the same name, and a
  # Kubernetes UID that I don't trust will remain stable from run to run.
  class_name = cls.__name__
  label_qs = []
  for k, v in labels.items():
    neo_label = kube_escape(k)
    label_qs.append(f"a.{neo_label}='{v}'")
  label_qss = ""
  if len(label_qs):
    label_qss = " AND " + " AND ".join(label_qs)
  query = f"""
  MATCH (a:{class_name}), (b:KubernetesNamespace), (c:KubernetesCluster) 
  WHERE b.name='{namespace_name}' AND c.name='{cluster_name}' {label_qss}
  AND (a)-[:NAMESPACE_RESOURCE]->(b) AND (b)-[:CLUSTER]->(c)
  RETURN a
  """
  params = None
  results, meta = db.cypher_query(query, params)
  kb = [cls.inflate(row[0]) for row in results]
  return kb

def kubernetes_filter_by_namespace(cls, namespace_name:str, cluster_name: str):
  """Get all resources of this kind in this namespace"""
  return kubernetes_filter_by_labels(cls, {}, namespace_name, cluster_name)


def kubernetes_filter_by_template_labels(cls, labels: dict, namespace_name: str, cluster_name: str):
  template_labels = {}
  for k,v in labels.items():
    template_labels[f"template/{k}"] = v
  return kubernetes_filter_by_labels(cls, template_labels, namespace_name, cluster_name)
