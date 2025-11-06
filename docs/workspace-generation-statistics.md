# Workspace Generation Statistics

## Overview

RunWhen Local now provides comprehensive statistics tracking throughout the workspace generation process. This feature helps you understand how many resources were discovered by CloudQuery, how many matched generation rules, and how many were successfully rendered into output files.

## Statistics Components

The statistics system tracks three main phases of workspace generation:

### 1. CloudQuery Discovery Phase
- **Resources discovered**: Total number of resources found by CloudQuery across all platforms
- **Resources added to registry**: Resources successfully parsed and added to the internal registry
- **Resources skipped**: Resources excluded due to filters, missing data, or parsing errors
- **Per-platform breakdown**: Statistics for each cloud platform (Azure, AWS, GCP, etc.)
- **Per-table breakdown**: Detailed statistics for each CloudQuery table (when `CQ_DEBUG=true`)

### 2. Generation Rules Matching Phase
- **Resources evaluated**: Total number of resources checked against generation rules
- **Resources matched**: Resources that matched at least one generation rule
- **SLXs generated**: Number of Service Level eXpectation (SLX) objects created
- **Output items generated**: Number of individual files/templates queued for rendering
- **Match rate**: Percentage of evaluated resources that matched rules

### 3. Rendering Phase
- **Output items to render**: Total number of files to be generated
- **Successfully rendered**: Files successfully created
- **Skipped due to errors**: Files that failed to render (with detailed error report)
- **Success rate**: Percentage of files successfully rendered

## Example Output

```
================================================================================
WORKSPACE GENERATION SUMMARY
================================================================================

📊 CLOUDQUERY DISCOVERY:
   Resources discovered: 1,247
   Resources added to registry: 1,198
   Resources skipped: 49
   Discovery duration: 45.32s
   └─ AZURE: 1,247 discovered, 1,198 added, 49 skipped

🎯 GENERATION RULES MATCHING:
   Resources evaluated: 1,198
   Resources matched: 856
   SLXs generated: 342
   Output items generated: 1,284
   Matching duration: 12.45s
   Match rate: 71.5%
   └─ AZURE: 1,198 evaluated, 856 matched (71.5%), 342 SLXs

🎨 RENDERING:
   Output items to render: 1,284
   Successfully rendered: 1,276
   Skipped due to errors: 8
   Rendering duration: 8.23s
   Success rate: 99.4%

📈 OVERALL SUMMARY:
   Discovery efficiency: 96.1% (1,198 of 1,247 resources added to registry)
   Matching efficiency: 71.5% (856 of 1,198 resources matched)
   Rendering efficiency: 78.6% (1,276 of 1,626 items rendered)
   End-to-end efficiency: 102.4% (1,276 files from 1,247 discovered resources)
   Total processing time: 66.00s

💡 PERFORMANCE INSIGHTS:
   Discovery rate: 27.5 resources/second
   Evaluation rate: 96.2 resources/second
   Rendering rate: 155.1 files/second

🔧 RECOMMENDATIONS:
   • Excellent matching rate (71.5%) - generation rules are well-tuned
   • Great end-to-end efficiency (102.4%) - pipeline is well-optimized
================================================================================
```

## Understanding the Statistics

### Discovery Efficiency
- **High efficiency (>95%)**: Most discovered resources are valid and usable
- **Low efficiency (<80%)**: Many resources are being filtered out or have parsing issues
- **Common causes of low efficiency**: Restrictive LOD settings, missing required fields, tag filters

### Matching Efficiency
- **High efficiency (>70%)**: Generation rules are well-tuned for your resources
- **Medium efficiency (30-70%)**: Some optimization of generation rules may be beneficial
- **Low efficiency (<30%)**: Generation rules may not match your resource types well

### Rendering Efficiency
- **High efficiency (>95%)**: Templates are working well
- **Low efficiency (<90%)**: Template errors or missing dependencies
- **Check**: `skipped_templates_report.md` for detailed error information

### End-to-End Efficiency
This metric shows how many final output files are generated per discovered resource:
- **>100%**: Some resources generate multiple output files (normal for complex resources)
- **50-100%**: Good pipeline efficiency
- **<50%**: Significant resource loss through the pipeline

## Enabling Statistics

Statistics are automatically enabled and logged at `INFO` level. No configuration is required.

### Detailed Statistics

For more detailed statistics, enable CloudQuery debug logging:

```bash
CQ_DEBUG=true ./run.sh
```

This will show per-table statistics for CloudQuery discovery:

```
DEBUG: Table azure_compute_virtual_machines: discovered=45, added=43, skipped=2
DEBUG: Table azure_storage_accounts: discovered=12, added=12, skipped=0
DEBUG: Table azure_network_virtual_networks: discovered=8, added=8, skipped=0
```

## Using Statistics for Optimization

### Improving Discovery Efficiency

If many resources are being skipped:

1. **Check LOD settings**: Ensure namespace/resource group LODs are appropriate
2. **Review filters**: Check include/exclude tags and annotations
3. **Validate credentials**: Ensure proper access to all required resources

### Improving Matching Efficiency

If few resources are matching generation rules:

1. **Review resource types**: Ensure generation rules target the right resource types
2. **Check match predicates**: Verify match conditions are appropriate for your resources
3. **Examine LOD requirements**: Ensure generation rule LODs match resource LODs

### Improving Rendering Efficiency

If many items fail to render:

1. **Check template errors**: Review `skipped_templates_report.md`
2. **Validate dependencies**: Ensure all required template variables are available
3. **Fix template syntax**: Address any Jinja2 template syntax errors

## Performance Monitoring

The statistics also provide performance insights:

- **Discovery rate**: Resources processed per second during CloudQuery sync
- **Evaluation rate**: Resources evaluated per second during rule matching
- **Rendering rate**: Files rendered per second during output generation

Use these metrics to:
- Identify performance bottlenecks
- Compare performance across different runs
- Optimize resource discovery and processing

## Integration with Existing Logging

The statistics system integrates seamlessly with existing logging:

- **INFO level**: Summary statistics (always shown)
- **DEBUG level**: Detailed per-table/per-platform breakdowns
- **CQ_DEBUG=true**: CloudQuery-specific detailed statistics

## Troubleshooting

### No Statistics Shown

If you don't see statistics:
1. Ensure log level is set to `INFO` or higher
2. Check that CloudQuery and generation rules components are running
3. Verify that resources are being discovered

### Unexpected Numbers

If statistics seem incorrect:
1. Enable `CQ_DEBUG=true` for detailed breakdown
2. Check component execution order in the pipeline
3. Review log messages for any error conditions

### Performance Issues

If processing is slow:
1. Check discovery rate - CloudQuery sync performance
2. Check evaluation rate - generation rules complexity
3. Check rendering rate - template complexity and I/O performance

## See Also

- [CloudQuery Debug Logging](cloudquery-debug-logging.md)
- [Level of Detail Configuration](configuration/level-of-detail.md)
- [Generation Rules Documentation](../README.md)
