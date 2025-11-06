"""
Workspace Summary Component

This component provides a comprehensive summary of the workspace generation process,
including statistics from CloudQuery discovery, generation rules matching, and rendering.
"""

import logging
import time
from typing import Any, Dict

from component import Context

logger = logging.getLogger(__name__)

DOCUMENTATION = "Generate comprehensive workspace generation summary"

def enrich(context: Context) -> None:
    """Generate and log comprehensive workspace generation summary."""
    logger.info("=" * 80)
    logger.info("WORKSPACE GENERATION SUMMARY")
    logger.info("=" * 80)
    
    # Get statistics from various components
    cq_stats = context.get_property("CQ_STATS", {})
    gen_stats = context.get_property("GEN_STATS", {})
    render_stats = context.get_property("RENDER_STATS", {})
    
    # Calculate overall statistics
    total_duration = 0
    if cq_stats.get('duration'):
        total_duration += cq_stats['duration']
    if gen_stats.get('duration'):
        total_duration += gen_stats['duration']
    if render_stats.get('duration'):
        total_duration += render_stats['duration']
    
    # CloudQuery Discovery Summary
    if cq_stats:
        logger.info("")
        logger.info("📊 CLOUDQUERY DISCOVERY:")
        logger.info(f"   Resources discovered: {cq_stats.get('total_discovered', 0):,}")
        logger.info(f"   Resources added to registry: {cq_stats.get('total_added_to_registry', 0):,}")
        logger.info(f"   Resources skipped: {cq_stats.get('total_skipped', 0):,}")
        logger.info(f"   Discovery duration: {cq_stats.get('duration', 0):.2f}s")
        
        # Platform breakdown
        for platform_name, platform_stats in cq_stats.get('platforms', {}).items():
            logger.info(f"   └─ {platform_name.upper()}: {platform_stats['discovered']:,} discovered, {platform_stats['added_to_registry']:,} added, {platform_stats['skipped']:,} skipped")
    
    # Generation Rules Summary
    if gen_stats:
        logger.info("")
        logger.info("🎯 GENERATION RULES MATCHING:")
        logger.info(f"   Resources evaluated: {gen_stats.get('total_resources_evaluated', 0):,}")
        logger.info(f"   Resources matched: {gen_stats.get('total_resources_matched', 0):,}")
        logger.info(f"   SLXs generated: {gen_stats.get('total_slxs_generated', 0):,}")
        logger.info(f"   Output items generated: {gen_stats.get('total_output_items_generated', 0):,}")
        logger.info(f"   Matching duration: {gen_stats.get('duration', 0):.2f}s")
        
        # Calculate match rate
        total_evaluated = gen_stats.get('total_resources_evaluated', 0)
        total_matched = gen_stats.get('total_resources_matched', 0)
        match_rate = (total_matched / total_evaluated * 100) if total_evaluated > 0 else 0
        logger.info(f"   Match rate: {match_rate:.1f}%")
        
        # Platform breakdown
        for platform_name, platform_stats in gen_stats.get('platforms', {}).items():
            platform_match_rate = (platform_stats['resources_matched'] / platform_stats['resources_evaluated'] * 100) if platform_stats['resources_evaluated'] > 0 else 0
            logger.info(f"   └─ {platform_name.upper()}: {platform_stats['resources_evaluated']:,} evaluated, {platform_stats['resources_matched']:,} matched ({platform_match_rate:.1f}%), {platform_stats['slxs_generated']:,} SLXs")
    
    # Rendering Summary
    if render_stats:
        logger.info("")
        logger.info("🎨 RENDERING:")
        logger.info(f"   Output items to render: {render_stats.get('total_output_items', 0):,}")
        logger.info(f"   Successfully rendered: {render_stats.get('successfully_rendered', 0):,}")
        logger.info(f"   Skipped due to errors: {render_stats.get('skipped', 0):,}")
        logger.info(f"   Rendering duration: {render_stats.get('duration', 0):.2f}s")
        
        # Calculate success rate
        total_items = render_stats.get('total_output_items', 0)
        successful = render_stats.get('successfully_rendered', 0)
        success_rate = (successful / total_items * 100) if total_items > 0 else 0
        logger.info(f"   Success rate: {success_rate:.1f}%")
    
    # Overall Summary
    logger.info("")
    logger.info("📈 OVERALL SUMMARY:")
    
    # Discovery to Registry efficiency
    discovered = cq_stats.get('total_discovered', 0)
    added_to_registry = cq_stats.get('total_added_to_registry', 0)
    registry_efficiency = (added_to_registry / discovered * 100) if discovered > 0 else 0
    logger.info(f"   Discovery efficiency: {registry_efficiency:.1f}% ({added_to_registry:,} of {discovered:,} resources added to registry)")
    
    # Registry to Match efficiency
    evaluated = gen_stats.get('total_resources_evaluated', 0)
    matched = gen_stats.get('total_resources_matched', 0)
    match_efficiency = (matched / evaluated * 100) if evaluated > 0 else 0
    logger.info(f"   Matching efficiency: {match_efficiency:.1f}% ({matched:,} of {evaluated:,} resources matched)")
    
    # Match to Render efficiency
    slxs_generated = gen_stats.get('total_slxs_generated', 0)
    output_items_generated = gen_stats.get('total_output_items_generated', 0)
    rendered = render_stats.get('successfully_rendered', 0)
    total_generated = slxs_generated + output_items_generated
    render_efficiency = (rendered / total_generated * 100) if total_generated > 0 else 0
    logger.info(f"   Rendering efficiency: {render_efficiency:.1f}% ({rendered:,} of {total_generated:,} items rendered)")
    
    # End-to-end efficiency
    end_to_end_efficiency = (rendered / discovered * 100) if discovered > 0 else 0
    logger.info(f"   End-to-end efficiency: {end_to_end_efficiency:.1f}% ({rendered:,} files from {discovered:,} discovered resources)")
    
    logger.info(f"   Total processing time: {total_duration:.2f}s")
    
    # Performance insights
    logger.info("")
    logger.info("💡 PERFORMANCE INSIGHTS:")
    if discovered > 0:
        resources_per_second = discovered / cq_stats.get('duration', 1)
        logger.info(f"   Discovery rate: {resources_per_second:.1f} resources/second")
    
    if evaluated > 0 and gen_stats.get('duration', 0) > 0:
        evaluations_per_second = evaluated / gen_stats.get('duration', 1)
        logger.info(f"   Evaluation rate: {evaluations_per_second:.1f} resources/second")
    
    if rendered > 0 and render_stats.get('duration', 0) > 0:
        renders_per_second = rendered / render_stats.get('duration', 1)
        logger.info(f"   Rendering rate: {renders_per_second:.1f} files/second")
    
    # Recommendations
    logger.info("")
    logger.info("🔧 RECOMMENDATIONS:")
    
    if registry_efficiency < 90:
        skipped = cq_stats.get('total_skipped', 0)
        if skipped > 0:
            logger.info(f"   • {skipped:,} resources were skipped during discovery - review LOD settings and filters")
    
    if match_efficiency < 50:
        logger.info(f"   • Low matching rate ({match_efficiency:.1f}%) - consider reviewing generation rules or resource types")
    elif match_efficiency > 90:
        logger.info(f"   • Excellent matching rate ({match_efficiency:.1f}%) - generation rules are well-tuned")
    
    if render_efficiency < 95:
        render_skipped = render_stats.get('skipped', 0)
        if render_skipped > 0:
            logger.info(f"   • {render_skipped:,} items failed to render - check skipped_templates_report.md for details")
    
    if end_to_end_efficiency < 10:
        logger.info(f"   • Low end-to-end efficiency ({end_to_end_efficiency:.1f}%) - consider optimizing the entire pipeline")
    elif end_to_end_efficiency > 50:
        logger.info(f"   • Great end-to-end efficiency ({end_to_end_efficiency:.1f}%) - pipeline is well-optimized")
    
    logger.info("")
    logger.info("=" * 80)
    logger.info("END OF WORKSPACE GENERATION SUMMARY")
    logger.info("=" * 80)
