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

# Anchor resources (the ones the passthrough rule matches) are always typed as
# deployments. The user-facing "kind" specified in inventory.resources is what
# flows into the rendered SLX's tags/additionalContext, but the gen rule only
# needs a single resource type to match against.
ANCHOR_RESOURCE_TYPE_NAME = KubernetesResourceType.DEPLOYMENT.value

# Default cluster/namespace identity used when the test config omits an
# inventory section entirely. Preserves backwards compatibility with simpler
# test configs.
DEFAULT_CLUSTER_NAME = "simulator-cluster"
DEFAULT_NAMESPACE_NAME = "simulator"

TEST_CONFIG_SETTING = Setting(
    "TEST_CONFIG",
    "testConfig",
    Setting.Type.STRING,
    "YAML string describing SLXs to synthesize for the simulator pipeline",
)

SETTINGS = (
    SettingDependency(TEST_CONFIG_SETTING, False),
)


def _ensure_cluster(registry: Registry, name: str):
    cluster = registry.lookup_resource(
        KUBERNETES_PLATFORM, KubernetesResourceType.CLUSTER.value, name
    )
    if cluster is None:
        cluster = registry.add_resource(
            platform_name=KUBERNETES_PLATFORM,
            resource_type_name=KubernetesResourceType.CLUSTER.value,
            resource_name=name,
            resource_qualified_name=name,
            resource_attributes={
                "context": name,
                "namespaces": {},
            },
        )
    return cluster


def _ensure_namespace(registry: Registry, cluster, ns_name: str,
                      labels: dict, annotations: dict):
    qualified_name = f"{cluster.name}/{ns_name}"
    namespace = registry.lookup_resource(
        KUBERNETES_PLATFORM,
        KubernetesResourceType.NAMESPACE.value,
        qualified_name,
    )
    if namespace is None:
        namespace = registry.add_resource(
            platform_name=KUBERNETES_PLATFORM,
            resource_type_name=KubernetesResourceType.NAMESPACE.value,
            resource_name=ns_name,
            resource_qualified_name=qualified_name,
            resource_attributes={
                "cluster": cluster,
                "lod": LevelOfDetail.DETAILED,
                "labels": labels or {},
                "annotations": annotations or {},
            },
        )
    return namespace


def _build_inventory_index(registry: Registry, inventory_config: dict) -> dict:
    """Materialize the cluster/namespace topology and build a lookup map from
    resource id (as referenced by SLX entries) to its info dict."""
    inventory_index: dict = {}
    cluster_lookup: dict = {}
    ns_lookup: dict = {}  # (cluster_name, ns_name) -> namespace resource

    for cluster_cfg in inventory_config.get("clusters") or []:
        cluster_name = cluster_cfg["name"]
        cluster = _ensure_cluster(registry, cluster_name)
        cluster_lookup[cluster_name] = cluster
        for ns_cfg in cluster_cfg.get("namespaces") or []:
            ns_name = ns_cfg["name"] if isinstance(ns_cfg, dict) else ns_cfg
            ns_labels = ns_cfg.get("labels") if isinstance(ns_cfg, dict) else {}
            ns_annotations = ns_cfg.get("annotations") if isinstance(ns_cfg, dict) else {}
            namespace = _ensure_namespace(
                registry, cluster, ns_name, ns_labels, ns_annotations
            )
            ns_lookup[(cluster_name, ns_name)] = namespace

    for resource_cfg in inventory_config.get("resources") or []:
        resource_id = resource_cfg["id"]
        cluster_name = resource_cfg["cluster"]
        ns_name = resource_cfg["namespace"]
        kind = resource_cfg.get("kind", "Deployment")
        resource_name = resource_cfg.get("name", resource_id)
        labels = resource_cfg.get("labels") or {}
        annotations = resource_cfg.get("annotations") or {}
        # Cluster + namespace must already exist (declared above) for a clean
        # inventory; if not, auto-create as a defensive default.
        cluster = cluster_lookup.get(cluster_name) or _ensure_cluster(registry, cluster_name)
        cluster_lookup.setdefault(cluster_name, cluster)
        namespace = ns_lookup.get((cluster_name, ns_name))
        if namespace is None:
            namespace = _ensure_namespace(registry, cluster, ns_name, {}, {})
            ns_lookup[(cluster_name, ns_name)] = namespace
        inventory_index[resource_id] = {
            "id": resource_id,
            "kind": kind,
            "name": resource_name,
            "cluster": cluster_name,
            "namespace": ns_name,
            "namespace_resource": namespace,
            "labels": labels,
            "annotations": annotations,
            "qualified_name": f"{cluster_name}/{ns_name}/{resource_name}",
            "resource_path": f"kubernetes/{cluster_name}/{ns_name}/{resource_name}",
        }
    return inventory_index


def _auto_derived_attrs_from_inventory(primary: dict, children: list[dict]) -> dict:
    """Compute SLX tags + additionalContext + qualifiers from the bound
    inventory resource(s). The first resource is the "primary"; any others are
    treated as child resources in additionalContext."""
    cluster = primary["cluster"]
    namespace = primary["namespace"]
    kind = primary["kind"]
    resource_name = primary["name"]
    qualified_name = primary["qualified_name"]
    resource_path = primary["resource_path"]

    tags = [
        {"name": "platform", "value": "kubernetes"},
        {"name": "cluster", "value": cluster},
        {"name": "namespace", "value": namespace},
        {"name": "kind", "value": kind},
        {"name": "resource_name", "value": resource_name},
        {"name": "resource_type", "value": kind.lower()},
    ]
    for label_key, label_value in (primary.get("labels") or {}).items():
        tags.append({"name": f"[k8s]{label_key}", "value": str(label_value)})

    additional_context = {
        "hierarchy": ["platform", "cluster", "resource_name"],
        "qualified_name": qualified_name,
        "resourcePath": resource_path,
    }
    if children:
        additional_context["childResources"] = [
            {
                "kind": c["kind"],
                "name": c["name"],
                "qualified_name": c["qualified_name"],
                "resourcePath": c["resource_path"],
            }
            for c in children
        ]

    qualifiers = {
        "namespace": namespace,
        "cluster": cluster,
    }

    return {
        "tags": tags,
        "additional_context": additional_context,
        "qualifiers": qualifiers,
    }


_OUTPUT_ITEM_KEYS = ("runbook", "sli", "slo")


def _merge_with_defaults(entry: dict, defaults: dict) -> dict:
    """Merge a per-SLX entry on top of the test config's `defaults` block.

    Top-level scalar/list fields: per-SLX value wins; if absent, default is
    used. Output-item subdicts (runbook/sli/slo): if the SLX has the key,
    deep-merge with the matching default subdict (per-SLX keys win); if the
    SLX doesn't have the key, the output item is NOT rendered (defaults
    alone don't trigger rendering — the SLX must opt in).
    """
    if not defaults:
        return dict(entry)

    merged = {}
    # Top-level fields from defaults first
    for key, value in defaults.items():
        if key in _OUTPUT_ITEM_KEYS:
            continue
        merged[key] = value
    # Top-level fields from entry override
    for key, value in entry.items():
        if key in _OUTPUT_ITEM_KEYS:
            continue
        merged[key] = value
    # Output items: merge only when the SLX has opted in by setting the key
    for output_key in _OUTPUT_ITEM_KEYS:
        if output_key not in entry:
            continue
        default_sub = defaults.get(output_key) or {}
        entry_sub = entry.get(output_key) or {}
        # Per-SLX keys win over defaults at this nested level too.
        merged_sub = dict(default_sub)
        merged_sub.update(entry_sub)
        merged[output_key] = merged_sub
    return merged


def _autoderive_path_to_robot(subdict: dict, code_bundle: str, item_kind: str) -> dict:
    """If a runbook/sli/slo subdict is non-empty but lacks pathToRobot, fill
    it in with the conventional codebundles/<bundle>/<item_kind>.robot path."""
    if not subdict:
        return subdict
    if "pathToRobot" in subdict and subdict["pathToRobot"]:
        return subdict
    result = dict(subdict)
    result["pathToRobot"] = f"codebundles/{code_bundle}/{item_kind}.robot"
    return result


def _resource_attrs_from_slx_entry(
    slug: str, entry: dict, inventory_index: dict
) -> tuple[dict, str, str]:
    """Project a test config SLX entry into the attribute dict for an anchor
    resource. Returns (attrs, cluster_name, namespace_name) so the caller can
    attach the anchor to the right namespace.

    Behavior:
      - If the entry has `resources: [<id>, ...]`, look up those inventory
        resources and auto-derive tags/additionalContext/qualifiers.
      - Else, fall back to the simulator-default cluster/namespace.
      - User-supplied tags/additionalContext on the entry override auto-derived
        ones (merged at top level).
    """
    code_bundle = entry["codeBundle"]
    runbook = _autoderive_path_to_robot(entry.get("runbook") or {}, code_bundle, "runbook")
    sli = entry.get("sli") or None
    if sli:
        sli = _autoderive_path_to_robot(sli, code_bundle, "sli")
    slo = entry.get("slo") or None
    if slo:
        slo = _autoderive_path_to_robot(slo, code_bundle, "slo")

    base_attrs = {
        "slx_slug": slug,
        "level_of_detail": entry.get("levelOfDetail", "basic"),
        "code_collection": entry["codeCollection"],
        "code_bundle": code_bundle,
        "repo_url": entry.get("repoURL", ""),
        "ref": entry.get("ref", "main"),
        "alias": entry.get("alias", slug),
        "statement": entry.get("statement", ""),
        "as_measured_by": entry.get("asMeasuredBy", ""),
        "image_url": entry.get("imageURL", ""),
        "owners": entry.get("owners", []),
        "config_provided": entry.get("configProvided", []),
        "runbook": runbook,
        "sli": sli,
        "slo": slo,
    }

    # Auto-derive from bound inventory resources, or fall back to defaults.
    resource_ids = entry.get("resources") or []
    bound_resources = [inventory_index[rid] for rid in resource_ids if rid in inventory_index]

    if bound_resources:
        primary, *children = bound_resources
        derived = _auto_derived_attrs_from_inventory(primary, children)
        cluster_name = primary["cluster"]
        namespace_name = primary["namespace"]
    else:
        derived = {
            "tags": [
                {"name": "platform", "value": "kubernetes"},
                {"name": "cluster", "value": DEFAULT_CLUSTER_NAME},
                {"name": "namespace", "value": DEFAULT_NAMESPACE_NAME},
                {"name": "kind", "value": "Deployment"},
                {"name": "resource_name", "value": slug},
                {"name": "resource_type", "value": "deployment"},
            ],
            "additional_context": {
                "hierarchy": ["platform", "cluster", "resource_name"],
                "qualified_name": f"{DEFAULT_CLUSTER_NAME}/{DEFAULT_NAMESPACE_NAME}/{slug}",
                "resourcePath": f"kubernetes/{DEFAULT_CLUSTER_NAME}/{DEFAULT_NAMESPACE_NAME}/{slug}",
            },
            "qualifiers": {
                "namespace": DEFAULT_NAMESPACE_NAME,
                "cluster": DEFAULT_CLUSTER_NAME,
            },
        }
        cluster_name = DEFAULT_CLUSTER_NAME
        namespace_name = DEFAULT_NAMESPACE_NAME

    # User overrides (if any) win over auto-derived values.
    user_tags = entry.get("tags")
    user_additional_context = entry.get("additionalContext")
    base_attrs["tags"] = user_tags if user_tags is not None else derived["tags"]
    if user_additional_context is not None:
        merged_ctx = dict(derived["additional_context"])
        merged_ctx.update(user_additional_context)
        base_attrs["additional_context"] = merged_ctx
    else:
        base_attrs["additional_context"] = derived["additional_context"]
    base_attrs["sim_qualifiers"] = derived["qualifiers"]

    return base_attrs, cluster_name, namespace_name


def index(context: Context):
    config_text = context.get_setting(TEST_CONFIG_SETTING)
    if not config_text:
        return

    config = yaml.safe_load(config_text) or {}
    inventory_config = config.get("inventory") or {}
    defaults_config = config.get("defaults") or {}
    slxs = config.get("slxs") or {}

    registry: Registry = context.get_property(REGISTRY_PROPERTY_NAME)
    if registry is None:
        registry = Registry()
        context.set_property(REGISTRY_PROPERTY_NAME, registry)

    inventory_index = _build_inventory_index(registry, inventory_config)

    # Ensure the default cluster + namespace exist for SLXs that didn't bind to
    # an inventory resource.
    default_cluster = _ensure_cluster(registry, DEFAULT_CLUSTER_NAME)
    _ensure_namespace(registry, default_cluster, DEFAULT_NAMESPACE_NAME, {}, {})

    for slug, entry in slxs.items():
        merged_entry = _merge_with_defaults(entry, defaults_config)
        attrs, cluster_name, namespace_name = _resource_attrs_from_slx_entry(
            slug, merged_entry, inventory_index
        )
        # Anchor resource attached to its (cluster, namespace).
        anchor_namespace = registry.lookup_resource(
            KUBERNETES_PLATFORM,
            KubernetesResourceType.NAMESPACE.value,
            f"{cluster_name}/{namespace_name}",
        )
        if anchor_namespace is None:
            cluster = _ensure_cluster(registry, cluster_name)
            anchor_namespace = _ensure_namespace(
                registry, cluster, namespace_name, {}, {}
            )

        attrs["namespace"] = anchor_namespace
        attrs["kind"] = "Deployment"
        attrs["labels"] = {}
        attrs["annotations"] = {}
        qualified_name = f"{cluster_name}/{namespace_name}/{slug}"
        registry.add_resource(
            platform_name=TEST_PLATFORM_NAME,
            resource_type_name=ANCHOR_RESOURCE_TYPE_NAME,
            resource_name=slug,
            resource_qualified_name=qualified_name,
            resource_attributes=attrs,
        )
