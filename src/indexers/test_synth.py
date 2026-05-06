import yaml

from component import Context, Setting, SettingDependency
from indexers.kubetypes import KUBERNETES_PLATFORM, KubernetesResourceType
from resources import Registry, REGISTRY_PROPERTY_NAME
from enrichers.generation_rule_types import LevelOfDetail

DOCUMENTATION = "Synthesize deterministic test resources for E2E upload tests"

# Resources are registered under the existing kubernetes platform so that the
# already-registered KubernetesPlatformHandler picks them up. The simulator's
# inventory effectively pretends to be a kubernetes inventory.
TEST_PLATFORM_NAME = KUBERNETES_PLATFORM
TEST_RESOURCE_TYPE_NAME = KubernetesResourceType.DEPLOYMENT.value

# Synthetic cluster/namespace identity. Real pipelines use real cluster/namespace
# resources; the simulator just needs *something* attached so that the kubernetes
# platform handler's get_level_of_detail/get_namespace traversal doesn't blow up.
SYNTH_CLUSTER_NAME = "simulator-cluster"
SYNTH_NAMESPACE_NAME = "simulator"
SYNTH_NAMESPACE_QUALIFIED_NAME = f"{SYNTH_CLUSTER_NAME}/{SYNTH_NAMESPACE_NAME}"

TEST_CONFIG_SETTING = Setting(
    "TEST_CONFIG",
    "testConfig",
    Setting.Type.STRING,
    "YAML string describing SLXs to synthesize for the simulator pipeline",
)

SETTINGS = (
    SettingDependency(TEST_CONFIG_SETTING, False),
)


def _resource_attrs_from_slx_entry(slug: str, entry: dict) -> dict:
    """Project a test config SLX entry into the attribute dict for a synthesized resource.

    Captures both the codecollection identity (used to render
    `spec.codeBundle.{repoUrl, ref, pathToRobot}` on runbook/sli/slo) and the
    optional SLX manifest metadata (alias, statement, owners, ...) needed to
    produce a workspace upload archive that matches the schema the platform
    expects. Anything not provided in the test config falls back to a sensible
    default so the templates don't have to guard every field.
    """
    sli = entry.get("sli") or None
    slo = entry.get("slo") or None
    return {
        "slx_slug": slug,
        "level_of_detail": entry.get("levelOfDetail", "basic"),
        "code_collection": entry["codeCollection"],
        "code_bundle": entry["codeBundle"],
        # Source codecollection identity (rendered into spec.codeBundle on
        # runbook/sli/slo). Defaults are placeholder values so absent fields
        # produce a structurally-valid (but non-runnable) reference.
        "repo_url": entry.get("repoURL", ""),
        "ref": entry.get("ref", "main"),
        # SLX manifest fields (rendered into slx.yaml's spec). All optional;
        # defaults match the empty/zero shape produced by real workspace
        # builder runs when the source generation rule omits them.
        "alias": entry.get("alias", slug),
        "statement": entry.get("statement", ""),
        "as_measured_by": entry.get("asMeasuredBy", ""),
        "image_url": entry.get("imageURL", ""),
        "owners": entry.get("owners", []),
        "config_provided": entry.get("configProvided", []),
        "tags": entry.get("tags", []),
        "additional_context": entry.get("additionalContext", {}),
        # Output-item subdicts (passed through into runbook/sli/slo .spec).
        "runbook": entry.get("runbook") or {},
        "sli": sli,
        "slo": slo,
    }


def _ensure_synthetic_namespace(registry: Registry):
    """Create (or reuse) a synthetic kubernetes cluster + namespace pair so the
    synthesized deployment resources have the cluster/namespace traversal that the
    kubernetes platform handler expects."""
    cluster = registry.lookup_resource(
        KUBERNETES_PLATFORM, KubernetesResourceType.CLUSTER.value, SYNTH_CLUSTER_NAME
    )
    if cluster is None:
        cluster = registry.add_resource(
            platform_name=KUBERNETES_PLATFORM,
            resource_type_name=KubernetesResourceType.CLUSTER.value,
            resource_name=SYNTH_CLUSTER_NAME,
            resource_qualified_name=SYNTH_CLUSTER_NAME,
            resource_attributes={
                "context": SYNTH_CLUSTER_NAME,
                "namespaces": {},
            },
        )
    namespace = registry.lookup_resource(
        KUBERNETES_PLATFORM,
        KubernetesResourceType.NAMESPACE.value,
        SYNTH_NAMESPACE_QUALIFIED_NAME,
    )
    if namespace is None:
        namespace = registry.add_resource(
            platform_name=KUBERNETES_PLATFORM,
            resource_type_name=KubernetesResourceType.NAMESPACE.value,
            resource_name=SYNTH_NAMESPACE_NAME,
            resource_qualified_name=SYNTH_NAMESPACE_QUALIFIED_NAME,
            resource_attributes={
                "cluster": cluster,
                "lod": LevelOfDetail.DETAILED,
                "labels": {},
                "annotations": {},
            },
        )
    return namespace


def index(context: Context):
    config_text = context.get_setting(TEST_CONFIG_SETTING)
    if not config_text:
        return

    config = yaml.safe_load(config_text) or {}
    slxs = config.get("slxs") or {}

    registry: Registry = context.get_property(REGISTRY_PROPERTY_NAME)
    if registry is None:
        registry = Registry()
        context.set_property(REGISTRY_PROPERTY_NAME, registry)

    namespace = _ensure_synthetic_namespace(registry) if slxs else None

    for slug, entry in slxs.items():
        attrs = _resource_attrs_from_slx_entry(slug, entry)
        # Standard kubernetes deployment fields expected by the kubernetes platform
        # handler and downstream enrichers.
        attrs["namespace"] = namespace
        attrs["kind"] = "Deployment"
        attrs["labels"] = {}
        attrs["annotations"] = {}
        qualified_name = f"{SYNTH_NAMESPACE_QUALIFIED_NAME}/{slug}"
        registry.add_resource(
            platform_name=TEST_PLATFORM_NAME,
            resource_type_name=TEST_RESOURCE_TYPE_NAME,
            resource_name=slug,
            resource_qualified_name=qualified_name,
            resource_attributes=attrs,
        )
