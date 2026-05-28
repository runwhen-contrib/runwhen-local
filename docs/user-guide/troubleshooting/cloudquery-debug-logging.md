# CloudQuery Debug Logging Control

## Overview

CloudQuery debug logging is extremely verbose and can overwhelm other important logs when troubleshooting. To address this, we've introduced a separate `CQ_DEBUG` environment variable that allows you to control CloudQuery-specific debug logging independently from general debug logging.

## Problem Statement

Previously, all debug logging was controlled by a single `DEBUG_LOGGING` environment variable. When set to `true`, this would enable:

1. **General debug logging** for the workspace builder
2. **Azure SDK debug logging** (azure.identity, azure.mgmt, etc.)
3. **CloudQuery debug logging** (extremely verbose)

This made it difficult to troubleshoot issues because CloudQuery's debug output would flood the logs, making it hard to see other important debug information.

## Solution

We've introduced a separate `CQ_DEBUG` environment variable specifically for CloudQuery debug logging, allowing fine-grained control:

- `DEBUG_LOGGING=true` - Controls general debug logging and Azure SDKs
- `CQ_DEBUG=true` - Controls CloudQuery-specific debug logging

These can be set independently, giving you complete control over logging verbosity.

## Usage

### Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `DEBUG_LOGGING` | General debug logging, Azure SDKs | `false` |
| `CQ_DEBUG` | CloudQuery-specific debug logging | `false` |

### Common Scenarios

#### 1. Normal Operation (Minimal Logging)
```bash
# Neither variable set - minimal logging
./run.sh
```

#### 2. General Debug (Without CloudQuery Noise)
```bash
# See general debug logs and Azure SDK logs, but not CloudQuery verbose output
DEBUG_LOGGING=true ./run.sh
```

#### 3. CloudQuery Debug Only
```bash
# Only see CloudQuery debug logs (useful for CloudQuery-specific issues)
CQ_DEBUG=true ./run.sh
```

#### 4. Full Debug (Maximum Verbosity)
```bash
# See all debug logs (very verbose!)
DEBUG_LOGGING=true CQ_DEBUG=true ./run.sh
```

### Docker Usage

```bash
# General debug without CloudQuery noise
docker run -e DEBUG_LOGGING=true runwhen-local

# CloudQuery debug only
docker run -e CQ_DEBUG=true runwhen-local

# Both (maximum verbosity)
docker run -e DEBUG_LOGGING=true -e CQ_DEBUG=true runwhen-local
```

## What CQ_DEBUG Controls

When `CQ_DEBUG=true` is set, the following CloudQuery-specific debug features are enabled:

### 1. CloudQuery Command Arguments
```bash
# Without CQ_DEBUG
cloudquery sync /config

# With CQ_DEBUG=true
cloudquery --log-level debug sync /config
```

### 2. Environment Variables Logging
Logs all CloudQuery environment variables (with sensitive values masked):
```
DEBUG: CloudQuery environment variables:
DEBUG:   AZURE_TENANT_ID=your-tenant-id
DEBUG:   AZURE_CLIENT_ID=your-client-id
DEBUG:   AZURE_CLIENT_SECRET=***MASKED***
DEBUG:   CQ_PLUGIN_DIR=/tmp/cloudquery_plugins
```

### 3. Configuration File Contents
Logs the complete CloudQuery configuration files:
```
DEBUG: -------CloudQuery azure CONFIG-------
kind: source
spec:
  name: azure
  path: cloudquery/azure
  version: v11.4.3
  ...
```

### 4. Database Schema Information
Logs table schemas and field information:
```
DEBUG: Table azure_compute_virtual_machines schema:
DEBUG:   Column: id (TEXT)
DEBUG:   Column: name (TEXT)
DEBUG:   Column: location (TEXT)
```

### 5. Resource Processing Details
Logs detailed information about each resource being processed:
```
DEBUG: Resource vm-prod-01 (type: virtual_machine):
DEBUG:   Subscription ID: 12345678-1234-1234-1234-123456789012
DEBUG:   LOD: detailed
DEBUG:   Qualified name: rg-prod/vm-prod-01
```

### 6. CloudQuery Output Parsing
Logs CloudQuery's stdout/stderr output for debugging sync issues:
```
DEBUG: CloudQuery: Syncing table azure_compute_virtual_machines
DEBUG: CloudQuery: Synced 150 rows for table azure_compute_virtual_machines
```

## Benefits

### 1. **Reduced Log Noise**
- CloudQuery debug logs are extremely verbose
- You can now see other important logs without CloudQuery overwhelming the output
- Easier to troubleshoot non-CloudQuery issues

### 2. **Targeted Debugging**
- Set `CQ_DEBUG=true` only when debugging CloudQuery-specific issues
- Use `DEBUG_LOGGING=true` for general workspace builder debugging
- Combine both when needed for comprehensive debugging

### 3. **Better Development Experience**
- Developers can focus on relevant logs
- Faster log analysis and troubleshooting
- More granular control over logging verbosity

### 4. **Production Friendly**
- Avoid accidentally enabling verbose CloudQuery logging in production
- Fine-tune logging levels based on specific debugging needs
- Maintain performance while still having debug capabilities available

## Implementation Details

### Code Changes

The implementation separates debug logging control in `src/indexers/cloudquery.py`:

```python
# General debug logging (affects Azure SDKs, etc.)
debug_logging_str = os.environ.get('DEBUG_LOGGING')
debug_logging = debug_logging_str is not None and debug_logging_str.lower() == 'true'

# Separate CloudQuery debug logging control
cq_debug_logging_str = os.environ.get('CQ_DEBUG')
cq_debug_logging = cq_debug_logging_str is not None and cq_debug_logging_str.lower() == 'true'

# Azure SDKs use general debug logging
if debug_logging:
    logging.getLogger("azure").setLevel(logging.DEBUG)
    logging.getLogger("azure.identity").setLevel(logging.DEBUG)
    logging.getLogger("azure.mgmt").setLevel(logging.DEBUG)

# CloudQuery uses separate debug flag
if cq_debug_logging:
    cq_args += ["--log-level", "debug"]
```

### Backward Compatibility

This change is fully backward compatible:

- Existing `DEBUG_LOGGING=true` usage continues to work for general debug logging
- Azure SDK logging behavior remains unchanged
- No breaking changes to existing scripts or configurations
- New `CQ_DEBUG` variable is optional and defaults to `false`

## Troubleshooting

### CloudQuery Issues
```bash
# Enable CloudQuery debug logging to see detailed sync information
CQ_DEBUG=true ./run.sh
```

### General Issues (Non-CloudQuery)
```bash
# Enable general debug logging without CloudQuery noise
DEBUG_LOGGING=true ./run.sh
```

### Azure Authentication Issues
```bash
# Enable Azure SDK debug logging
DEBUG_LOGGING=true ./run.sh
```

### Complete Debugging (All Systems)
```bash
# Enable all debug logging (very verbose!)
DEBUG_LOGGING=true CQ_DEBUG=true ./run.sh
```

## See Also

- [CloudQuery Documentation](https://docs.cloudquery.io/)
- [Azure SDK Logging](https://docs.microsoft.com/en-us/azure/developer/python/sdk/azure-sdk-logging)
- [RunWhen Local Configuration](../README.md)
