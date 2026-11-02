# Basic K8s Tests

This directory contains basic Kubernetes tests for RunWhen Local. CI runs them
against a disposable [KIND](https://kind.sigs.k8s.io/) cluster that this
directory creates on the fly (no shared SANDBOX cluster required).

## Test Overview

- **ci-test-1**: Basic K8s test with basic LOD (Level of Detail)
- **ci-test-2**: K8s test with detailed LOD for specific namespaces
- **ci-test-local-git**: Validates local git functionality with pre-cached repositories

## Test Cluster (KIND)

The tests read a kubeconfig from `./kubeconfig.secret` (mounted into the
container as `/shared/kubeconfig.secret`) and expect the context
`kind-rwl-ci`. `kind-up.sh` creates that cluster and writes the kubeconfig:

```bash
cd .test/k8s/basic
./kind-up.sh rwl-ci
```

It also applies the `ci-verify-basic` fixture
([`kind/ci-verify-basic.yaml`](kind/ci-verify-basic.yaml)) — the Namespace, a
`podinfo` Deployment, its Service, an Ingress and a HelmRelease (via the
minimal CRD in [`kind/crds/`](kind/crds/)). This mirrors the workloads that
previously lived in the SANDBOX cluster's `ci-verify-basic` namespace, which is
what the SLX-count assertions (>=5 basic, >=12 detailed) are based on.

The exported kubeconfig points at the control-plane container over the kind
Docker network. Run the tests with `RWL_CONTAINER_NETWORK=kind` so the RunWhen
Local container joins that network and can reach the API server:

```bash
cd .test/k8s/basic
RWL_CONTAINER_NETWORK=kind task ci-test-1
```

On Linux, `kind-up.sh` installs `kind` automatically if it is missing. On
macOS, install it first (`brew install kind`).

## Local Git Test (`ci-test-local-git`)

The `ci-test-local-git` test specifically validates that RunWhen Local can successfully use pre-cached git repositories when `useLocalGit: true` is configured.

### What it tests:
- Verifies that local git cache directories are properly configured as "safe directories"
- Ensures no "dubious ownership" git errors occur
- Validates that the workspace builder can access pre-cached codecollection repositories
- Confirms that SLX generation works with local git repositories

### How to run locally:
```bash
cd .test/k8s/basic
./kind-up.sh rwl-ci
RWL_CONTAINER_NETWORK=kind task ci-test-local-git
```

### Troubleshooting:

If you encounter git ownership errors like:
```
SHA is empty, possible dubious ownership in the repository at /home/runwhen/codecollection-cache/rw-public-codecollection.git
```

This indicates that Git considers the repository to have "dubious ownership". The fix is automatically applied in the entrypoint script by adding the repository as a safe directory:
```bash
git config --global --add safe.directory /path/to/repo
```

### Configuration:

The test uses `workspaceInfo.yaml` with:
```yaml
useLocalGit: true
```

This tells RunWhen Local to use pre-cached git repositories from the container's `CODE_COLLECTION_CACHE_ROOT` directory instead of cloning from remote repositories.

## Running All Tests

To run all tests:
```bash
./kind-up.sh rwl-ci
RWL_CONTAINER_NETWORK=kind task ci-test-1
RWL_CONTAINER_NETWORK=kind task ci-test-2
RWL_CONTAINER_NETWORK=kind task ci-test-local-git
```

## Cleanup

Remove discovery output and the local container:
```
task clean
```

Tear down the KIND cluster entirely:
```bash
kind delete cluster --name rwl-ci
```
