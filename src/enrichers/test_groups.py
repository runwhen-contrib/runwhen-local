"""Simulator companion enricher that populates slxGroups and slxRelationships
from the testConfig YAML.

Runs after generation_rules so the SLXS_PROPERTY context property is fully
populated; we use it to translate user-facing SLX slugs into the qualified
{workspace}--{slx-dir} full names that workspace.yaml's slxGroups list and
slxRelationships list reference.
"""
import yaml

from component import Context, SettingDependency
from enrichers.generation_rules import (
    SLXS_PROPERTY,
    GROUPS_PROPERTY,
    SLX_RELATIONSHIPS_PROPERTY,
    Group,
    SLXRelationship,
)
from enrichers.map_customization_rules import RelationshipVerb
from indexers.test_synth import TEST_CONFIG_SETTING

DOCUMENTATION = (
    "Populate slxGroups and slxRelationships from the simulator's testConfig "
    "(only active when test_synth has populated SLXs from the same config)."
)

SETTINGS = (
    SettingDependency(TEST_CONFIG_SETTING, False),
)


def _slug_to_full_name_map(slxs_by_full_name: dict) -> dict:
    """Build slug -> workspace-prefixed full SLX name map from the SLXs that
    the gen rule produced.

    The passthrough rule uses qualifiers: [resource], so each SLXInfo's
    qualifier_values[0] is the slug (= the resource name = the test config
    dict key). The value we want for slxGroups / slxRelationships is the
    workspace-prefixed metadata.name, which is exposed as slx_info.name (NOT
    slx_info.full_name — that's the unprefixed qualified name).
    """
    slug_to_full = {}
    for slx_info in slxs_by_full_name.values():
        qualifier_values = getattr(slx_info, "qualifier_values", None)
        prefixed_name = getattr(slx_info, "name", None)
        if qualifier_values and prefixed_name:
            slug = qualifier_values[0]
            slug_to_full[slug] = prefixed_name
    return slug_to_full


def _resolve_verb(verb_str: str) -> str:
    """Resolve a user-supplied verb string into the canonical enum value.

    Returns the verb's string representation (not the enum object) because
    workspace.yaml's template stringifies the attribute via {{ verb }} and
    Python's default Enum.__str__ produces "RelationshipVerb.DEPENDENT_ON"
    instead of "dependent-on". Storing the value directly sidesteps the
    template's lack of a .value lookup.
    """
    if not verb_str:
        return RelationshipVerb.DEPENDENT_ON.value
    try:
        return RelationshipVerb(verb_str).value
    except ValueError:
        return verb_str


def enrich(context: Context):
    config_text = context.get_setting(TEST_CONFIG_SETTING)
    if not config_text:
        return

    config = yaml.safe_load(config_text) or {}
    groups_config = config.get("slxGroups") or []
    relationships_config = config.get("slxRelationships") or []

    if not groups_config and not relationships_config:
        return

    slxs_by_full_name = context.get_property(SLXS_PROPERTY) or {}
    slug_to_full = _slug_to_full_name_map(slxs_by_full_name)

    if groups_config:
        groups = context.get_property(GROUPS_PROPERTY)
        if groups is None:
            groups = {}
            context.set_property(GROUPS_PROPERTY, groups)
        for group_cfg in groups_config:
            name = group_cfg.get("name")
            if not name:
                continue
            slx_slugs = group_cfg.get("slxs") or []
            slx_full_names = [
                slug_to_full[s] for s in slx_slugs if s in slug_to_full
            ]
            dependencies = group_cfg.get("dependsOn") or []
            existing = groups.get(name)
            if existing is None:
                groups[name] = Group(name, slx_full_names, dependencies)
            else:
                for slx in slx_full_names:
                    if slx not in existing.slxs:
                        existing.add_slx(slx)
                for dep in dependencies:
                    if dep not in existing.dependencies:
                        existing.add_dependency(dep)

    if relationships_config:
        slx_relationships = context.get_property(SLX_RELATIONSHIPS_PROPERTY)
        if slx_relationships is None:
            slx_relationships = []
            context.set_property(SLX_RELATIONSHIPS_PROPERTY, slx_relationships)
        for rel_cfg in relationships_config:
            subject_slug = rel_cfg.get("subject")
            object_slug = rel_cfg.get("object")
            verb = _resolve_verb(rel_cfg.get("verb"))
            if not (subject_slug and object_slug):
                continue
            subject_full = slug_to_full.get(subject_slug, subject_slug)
            object_full = slug_to_full.get(object_slug, object_slug)
            slx_relationships.append(
                SLXRelationship(subject_full, verb, object_full)
            )
