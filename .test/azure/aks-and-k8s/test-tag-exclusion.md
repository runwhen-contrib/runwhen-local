# Tag Exclusion Test Documentation

## Overview

The `ci-test-tag-exclusion` task validates that the `taskTagExclusions` configuration in `workspaceInfo.yaml` properly filters out codebundles with excluded tags during the RunWhen Local discovery process.

## Test Purpose

This test ensures that:
1. Codebundles with excluded tags are properly filtered out and do not generate SLXs
2. Codebundles without excluded tags continue to work normally
3. The tag exclusion mechanism functions correctly in a controlled environment

## Test Configuration

### Scope Limitations
To ensure predictable and reliable test results, the test uses a controlled discovery scope:

```yaml
defaultLOD: none                    # Minimal overall discovery
taskTagExclusions: 
  - "access:read-only"             # Exclude codebundles with read-only access tags

cloudConfig:
  kubernetes:
    contexts:
      sandbox-cluster-1: 
        defaultNamespaceLOD: detailed  # Only detailed discovery for K8s
    namespaces:
      - kube-system                    # Limited to specific namespaces
      - ci-verify-basic
  azure:
    aksClusters:
      defaultNamespaceLOD: none        # Minimal AKS discovery
    resourceGroupLevelOfDetails:
      $cluster_resource_group: none    # Minimal Azure resource discovery
```

### Test Codebundles
The test uses two specific codebundles to validate exclusion behavior:

1. **`k8s-deployment-healthcheck`** (Should be ALLOWED)
   - Compatible with read-only access restrictions
   - Should generate SLXs normally

2. **`k8s-deployment-ops`** (Should be EXCLUDED)
   - Contains read-write operations that conflict with `access:read-only` exclusion
   - Should be filtered out and generate no SLXs

## Expected Results

### SLX Count
- **Expected SLXs**: `8` (estimated for the controlled scope)
- This count should be consistent across test runs
- Adjust this value based on actual results during test development

### Tag Exclusion Validation
- **No files** should contain references to `k8s-deployment-ops`
- **Files should exist** containing references to `k8s-deployment-healthcheck`
- The test validates both positive and negative cases

## Test Implementation

### Test Flow
1. **Infrastructure Setup**: Extract cluster details from Terraform state
2. **Configuration Generation**: Create controlled `workspaceInfo.yaml`
3. **Discovery Execution**: Run RunWhen Local discovery
4. **Count Validation**: Verify exact SLX count matches expectations
5. **Exclusion Validation**: Verify tag exclusion behavior

### Validation Logic

#### SLX Count Check
```bash
total_slxs=$(cat slx_count.txt)
if [[ "$total_slxs" -lt "8" ]]; then
  echo "❌ Total SLX count failed"
  exit 1
fi
```

#### Tag Exclusion Check
```bash
# Should find NO files from excluded codebundle
excluded_files=$(find output/ -name "*.yaml" -exec grep -l "k8s-deployment-ops" {} \; 2>/dev/null || true)
if [ -n "$excluded_files" ]; then
  echo "❌ Tag exclusion failed: Found files from excluded codebundle"
  exit 1
fi

# Should find files from allowed codebundle
allowed_files=$(find output/ -name "*.yaml" -exec grep -l "k8s-deployment-healthcheck" {} \; 2>/dev/null || true)
if [ -z "$allowed_files" ]; then
  echo "❌ No files found from allowed codebundle"
  exit 1
fi
```

## Running the Test

### Prerequisites
- Terraform infrastructure deployed in the `terraform/` directory
- Required environment variables set:
  - `ARM_SUBSCRIPTION_ID`
  - `AZ_TENANT_ID`
  - `AZ_CLIENT_SECRET`
  - `AZ_CLIENT_ID`

### Execution
```bash
# Run the complete tag exclusion test
task ci-test-tag-exclusion

# Or run individual components
task ci-run-rwl-discovery        # Run discovery only
task verify-slx-count            # Verify SLX count only
task verify-tag-exclusion        # Verify tag exclusion only
```

## Troubleshooting

### Common Issues

#### Unexpected SLX Count
- **Cause**: Infrastructure changes or codebundle updates
- **Solution**: Run test once to see actual count, then update `EXPECTED_SLXS`

#### Tag Exclusion Not Working
- **Cause**: Codebundle tags may have changed
- **Solution**: Verify the actual tags in the codebundles:
  ```bash
  # Check codebundle metadata
  find output/ -name "*.yaml" -exec grep -l "tags:" {} \;
  ```

#### No Files Generated
- **Cause**: Discovery scope too restrictive or infrastructure issues
- **Solution**: Check discovery logs and verify cluster connectivity

### Debug Tips

1. **Enable Debug Logging**: The test runs with `DEBUG_LOGS=true`
2. **Check Discovery Output**: Review files in `output/workspaces/`
3. **Verify Infrastructure**: Ensure Terraform state is current
4. **Manual Validation**: Run discovery manually with broader scope to compare

## Test Maintenance

### When to Update
- **Codebundle Changes**: If test codebundles are updated or removed
- **Infrastructure Changes**: If cluster setup changes significantly
- **Tag System Changes**: If the tag exclusion mechanism is modified

### Expected Count Adjustment
The `EXPECTED_SLXS` value may need adjustment when:
- Codebundles are added/removed from the test repository
- Discovery logic changes
- Infrastructure setup changes

To recalibrate:
1. Run the test and note the actual SLX count
2. Update the `EXPECTED_SLXS` variable in the Taskfile
3. Re-run to confirm consistency

## Integration with CI/CD

This test is designed to be part of the automated test suite:
- **Fast execution** due to limited discovery scope
- **Predictable results** with controlled environment
- **Clear pass/fail criteria** with specific validation checks
- **Detailed error reporting** for debugging failures

The test validates a critical security and operational feature (tag exclusions) that ensures users can control which codebundles are executed in their environments. 