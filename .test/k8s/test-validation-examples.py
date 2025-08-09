#!/usr/bin/env python3
"""
Test script to create example YAML files for validation testing.
This demonstrates the validator catching the numeric tag value issue.
"""

import os
import tempfile
import subprocess
import sys
from pathlib import Path

def create_test_files():
    """Create test YAML files with known issues and fixes."""
    
    # Create temporary directory
    test_dir = Path("test_output")
    test_dir.mkdir(exist_ok=True)
    
    # Problematic YAML with numeric values (like the original issue)
    problematic_yaml = """apiVersion: runwhen.com/v1
kind: SLX
metadata:
  name: test-problematic-slx
spec:
  tags:
  - name: platform
    value: kubernetes
  - name: cluster
    value: default
  - name: '[k8s]CAMRID'
    value: 0018916
  - name: '[k8s]cvCamrKey'
    value: 0018916
  - name: '[k8s]vks.visa.com/app-number'
    value: 0018916
  - name: access
    value: read-only
"""

    # Fixed YAML with properly quoted values
    fixed_yaml = """apiVersion: runwhen.com/v1
kind: SLX
metadata:
  name: test-fixed-slx
spec:
  tags:
  - name: platform
    value: kubernetes
  - name: cluster
    value: default
  - name: '[k8s]CAMRID'
    value: '0018916'
  - name: '[k8s]cvCamrKey'
    value: '0018916'
  - name: '[k8s]vks.visa.com/app-number'
    value: '0018916'
  - name: access
    value: read-only
"""

    # YAML with other issues for comprehensive testing
    other_issues_yaml = f"""apiVersion: runwhen.com/v1
kind: SLX
metadata:
  name: test-other-issues-slx
spec:
  tags:
  - name: "{'very-long-tag-name' * 20}"
    value: "test"
  - name: "empty-value-tag"
    value: ""
  - name: "whitespace-tag"
    value: "   "
  - name: "problematic/slash"
    value: "test"
"""

    # Write test files
    with open(test_dir / "problematic.yaml", "w") as f:
        f.write(problematic_yaml)
    
    with open(test_dir / "fixed.yaml", "w") as f:
        f.write(fixed_yaml)
    
    with open(test_dir / "other_issues.yaml", "w") as f:
        f.write(other_issues_yaml)
    
    print(f"✅ Created test files in {test_dir}/")
    return test_dir

def run_validation_test():
    """Run the validation test and show results."""
    
    print("🧪 K8s YAML Validation Test")
    print("=" * 40)
    
    # Create test files
    test_dir = create_test_files()
    
    # Run validation
    print(f"\n🔍 Running validation on {test_dir}/...")
    try:
        result = subprocess.run([
            "python3", "validate-yaml-compatibility.py", str(test_dir)
        ], capture_output=True, text=True, cwd=Path(__file__).parent)
        
        print("📋 Validation Output:")
        print("-" * 30)
        print(result.stdout)
        
        if result.stderr:
            print("⚠️  Stderr:")
            print(result.stderr)
        
        print(f"\n📊 Exit Code: {result.returncode}")
        
        if result.returncode == 0:
            print("✅ Validation passed (no critical errors)")
        else:
            print("❌ Validation failed (critical errors found)")
        
    except FileNotFoundError:
        print("❌ Could not find validation script. Make sure validate-yaml-compatibility.py exists.")
        return False
    except Exception as e:
        print(f"❌ Error running validation: {e}")
        return False
    
    # Cleanup
    import shutil
    shutil.rmtree(test_dir)
    print(f"\n🧹 Cleaned up {test_dir}/")
    
    return result.returncode == 1  # We expect failure due to the problematic file

if __name__ == "__main__":
    success = run_validation_test()
    if success:
        print("\n🎉 Test completed successfully - validation correctly detected issues!")
    else:
        print("\n❌ Test failed - validation did not work as expected")
        sys.exit(1) 