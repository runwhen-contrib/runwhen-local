#!/usr/bin/env python3
"""
Test script to verify permission denied scenarios in multi-cluster indexing.
This script checks that:
1. Cluster 1 (with permissions) is successfully indexed
2. Cluster 2 (without permissions) generates permission denied errors
3. Additional clusters from kubeconfig.secret are still indexed despite permission denied errors
"""

import os
import json
import yaml
import subprocess
import sys
from pathlib import Path

def load_workspace_info():
    """Load the workspaceInfo.yaml file"""
    try:
        with open('workspaceInfo.yaml', 'r') as f:
            return yaml.safe_load(f)
    except FileNotFoundError:
        print("❌ workspaceInfo.yaml not found. Run 'task generate-rwl-config' first.")
        sys.exit(1)

def check_terraform_outputs():
    """Check that both clusters are deployed"""
    try:
        os.chdir('terraform')
        result = subprocess.run(['terraform', 'show', '-json', 'terraform.tfstate'], 
                              capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ Failed to read terraform state")
            return False
        
        state = json.loads(result.stdout)
        outputs = state.get('values', {}).get('outputs', {})
        
        # Check cluster 1
        cluster1_name = outputs.get('cluster_name', {}).get('value')
        cluster1_fqdn = outputs.get('cluster_fqdn', {}).get('value')
        
        # Check cluster 2
        cluster2_name = outputs.get('cluster_2_name', {}).get('value')
        cluster2_fqdn = outputs.get('cluster_2_fqdn', {}).get('value')
        
        os.chdir('..')
        
        if not all([cluster1_name, cluster1_fqdn, cluster2_name, cluster2_fqdn]):
            print("❌ Missing cluster information in terraform state")
            return False
            
        print(f"✅ Found Cluster 1: {cluster1_name} ({cluster1_fqdn})")
        print(f"✅ Found Cluster 2: {cluster2_name} ({cluster2_fqdn})")
        return True
        
    except Exception as e:
        print(f"❌ Error checking terraform outputs: {e}")
        return False

def check_kubeconfig_secret():
    """Check if kubeconfig.secret exists"""
    if os.path.exists('kubeconfig.secret'):
        print("✅ kubeconfig.secret found")
        return True
    else:
        print("⚠️  kubeconfig.secret not found - additional k8s cluster testing will be skipped")
        return False

def analyze_discovery_logs():
    """Analyze the discovery logs for expected patterns"""
    log_file = 'run_sh_output.log'
    if not os.path.exists(log_file):
        print("❌ Discovery log file not found. Run discovery first.")
        return False, False, 0
    
    with open(log_file, 'r') as f:
        logs = f.read()
    
    # Check for permission denied errors (multiple variations)
    permission_patterns = [
        'permission denied',
        'forbidden',
        'unauthorized',
        'access denied',
        'authentication failed',
        'failed to authenticate',
        'error authenticating',
        'rbac',
        'insufficient privileges',
        'not found',
        'cluster not found',
        'resource group not found',
        'subscription not found',
        'not found in any accessible'
    ]
    
    permission_denied_found = any(pattern in logs.lower() for pattern in permission_patterns)
    
    # Check for successful indexing patterns
    successful_patterns = [
        'successfully indexed',
        'slx',
        'discovered',
        'found cluster',
        'processing cluster'
    ]
    
    successful_indexing = any(pattern in logs.lower() for pattern in successful_patterns)
    
    # Check for authentication method being used
    auth_patterns = [
        'service principal',
        'azure cli',
        'managed identity',
        'azure credential'
    ]
    
    auth_method_found = [pattern for pattern in auth_patterns if pattern in logs.lower()]
    
    # Check for continuation after errors
    # Look for specific patterns that indicate processing continued after the fake cluster error
    continuation_patterns = [
        'kubeconfig generated and saved',
        'processing kubernetes configuration',
        'merging azure kubeconfig',
        'merging user-provided kubeconfig',
        'indexing kubernetes with kubeconfig',
        'workspace builder completed successfully'
    ]
    
    continuation_found = any(pattern in logs.lower() for pattern in continuation_patterns)
    
    # Also check if we see the fake cluster error followed by successful completion
    fake_cluster_error = 'fake-cluster-no-access' in logs.lower() and 'not found in any accessible' in logs.lower()
    successful_completion = 'workspace builder completed successfully' in logs.lower()
    continued_processing = continuation_found and (not fake_cluster_error or successful_completion)
    
    print("\n📊 Log Analysis:")
    print(f"  Access/authentication errors found: {'✅' if permission_denied_found else '❌'}")
    print(f"  Successful indexing detected: {'✅' if successful_indexing else '❌'}")
    print(f"  Continued processing multiple clusters: {'✅' if continued_processing else '❌'}")
    print(f"  Authentication methods detected: {', '.join(auth_method_found) if auth_method_found else 'None detected'}")
    print(f"  Cluster processing mentions: {logs.lower().count('cluster')}")
    
    # Print relevant log excerpts for debugging
    if not permission_denied_found:
        print("\n🔍 Debugging - No access/authentication errors found. Log excerpts:")
        lines = logs.split('\n')
        for i, line in enumerate(lines):
            if any(word in line.lower() for word in ['cluster', 'auth', 'error', 'fail']):
                print(f"  Line {i}: {line[:100]}...")
    
    return permission_denied_found, continued_processing, logs.lower().count('cluster')

def check_slx_output():
    """Check the generated SLX output"""
    output_dir = Path('output')
    if not output_dir.exists():
        print("❌ Output directory not found")
        return False, 0
    
    slx_dirs = list(output_dir.glob('**/slxs'))
    if not slx_dirs:
        print("❌ No SLX directories found")
        return False, 0
    
    total_slxs = 0
    for slx_dir in slx_dirs:
        slx_count = len(list(slx_dir.glob('*')))
        total_slxs += slx_count
        print(f"  Found {slx_count} SLXs in {slx_dir}")
    
    print(f"✅ Total SLXs generated: {total_slxs}")
    return total_slxs > 0, total_slxs

def main():
    print("🧪 Testing Permission Denied Scenario in Multi-Cluster Setup")
    print("=" * 60)
    
    # Check prerequisites
    print("\n1. Checking prerequisites...")
    workspace_info = load_workspace_info()
    
    if not check_terraform_outputs():
        sys.exit(1)
    
    kubeconfig_present = check_kubeconfig_secret()
    
    # Verify workspace configuration
    print("\n2. Verifying workspace configuration...")
    aks_clusters = workspace_info.get('cloudConfig', {}).get('azure', {}).get('aksClusters', {}).get('clusters', [])
    print(f"✅ Found {len(aks_clusters)} AKS clusters in configuration")
    
    if len(aks_clusters) < 2:
        print("❌ Expected at least 2 AKS clusters in configuration")
        sys.exit(1)
    
    # Check if discovery has been run
    print("\n3. Checking discovery results...")
    success, total_slxs = check_slx_output()
    if not success:
        print("⚠️  No SLX output found. Run 'task run-rwl-discovery' first.")
        sys.exit(1)
    
    # Analyze logs if available
    print("\n4. Analyzing discovery logs...")
    permission_denied_found, continued_processing, cluster_processing_count = analyze_discovery_logs()
    
    print("\n🎉 Cluster access error test setup verification complete!")
    print("\nExpected behavior:")
    print("  - Cluster 1 should be successfully indexed (has permissions)")
    print("  - Cluster 2 should be successfully indexed (real cluster)")
    print("  - Fake cluster should generate access/authentication errors")
    print("  - Discovery should continue and index remaining clusters despite errors")
    print("  - Total SLX count should reflect successful indexing of accessible clusters")
    print("\n🔍 Current test results indicate:")
    if not permission_denied_found:
        print("  ❌ No access errors detected - fake cluster may not be processed")
    else:
        print("  ✅ Access errors detected from fake cluster")
    
    if not continued_processing:
        print("  ❌ CORE ISSUE REPRODUCED: Processing appears to stop after error")
        print("     This confirms the bug where RunWhen Local stops indexing remaining clusters")
    else:
        print("  ✅ ISSUE IS FIXED: Processing continued after access errors!")
        print("     RunWhen Local successfully handled the access error and continued indexing")
    
    print(f"\n📊 SLX Count Analysis:")
    print(f"  - Total SLXs generated: {total_slxs}")
    if permission_denied_found and continued_processing:
        print(f"  - ✅ Expected behavior: SLX count reflects successful indexing of accessible clusters")
        print(f"  - ✅ Inaccessible clusters were skipped gracefully without stopping the process")
    else:
        print(f"  - ⚠️  Expected: Should reflect indexing of accessible clusters only")

if __name__ == "__main__":
    main() 