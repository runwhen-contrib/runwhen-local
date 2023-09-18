---
description: >-
  This page provides example manifests to have RunWhen Local deployed in a
  Kubernetes environment.
---

# Running in Kubernetes

{% hint style="info" %}
If you have any issues with this process, feel free to reach out on [Slack](https://runwhen.slack.com/join/shared\_invite/zt-1l7t3tdzl-IzB8gXDsWtHkT8C5nufm2A) or [GitHub](https://github.com/runwhen-contrib/runwhen-local) or [Discord](https://discord.com/invite/Ut7Ws4rm8Q)
{% endhint %}

## Overview

Some teams might benefit from running a single instance of RunWhen Local directly from a Kubernetes cluster, sharing copy & paste-able troubleshooting commands with an entire team.&#x20;

{% hint style="info" %}
The commands generated in the Troubleshooting Cheat Sheet include the specific kubeconfig context. In order for this tool to be of the greatest use to all users, each user should have their kubeconfig context set to the identical name as the one that is used to generate the cheat sheet.&#x20;
{% endhint %}

As we also host this in Kubernetes for the purposes of an online demo, this document will share the manifests that we have used in [our own demo environment](https://runwhen-local.sandbox.runwhen.com).&#x20;

### Kubeconfig Secret

RunWhen Local requires a Kubernetes secret that contains a valid Kubeconfig in order to discover resources and generate documentation for your clusters. This secret would need read permissions on the namespaces and resource types that you would like discovered - keeping in mind that listing and getting custom  resources (such as a helm controller) must be added to the OOTB viewer role.&#x20;

For additional resources on creating a long-lived service account and Kubeconfig, please see [generating-service-accounts-and-kubeconfigs.md](../../runwhen-platform/guides/kubernetes-environments/generating-service-accounts-and-kubeconfigs.md "mention").

### Kubernetes Manifests

Deploying RunWhen Local to a Kubernetes cluster can be achieved with the following manifests:&#x20;

* Deployment:&#x20;
  * Supports an environment variable titled `AUTORUN_WORKSPACE_BUILDER_INTERVAL` to control how often the Troubleshooting Cheat Sheet content is refreshed
  * Defines the following volumes to mount into the container:&#x20;
    * configmap-volume: mounts the workspaceInto.yaml file into the container
    * kubeconfig: mounts the kubeconfig secret into the container
* Service
  * A standard service will suffice to provide access to any running replicas. If not using an ingress object to expose the application outside of the cluster, users can use `kubectl port-forward` to access the RunWhen application through the service.&#x20;
* Ingress
  * The ingress object supports access from outside of the cluster to the RunWhen conatiner. An example ingress manifest is not provided, as this will vary from cluster to cluster.&#x20;
* ConfigMap
  * Stores the `workspaceInfo.yaml` file, which is the main configuration file that is used to customize how RunWhen Local builds it's Troubleshooting Cheat Sheet. See [advanced-configuration.md](../advanced-configuration.md "mention") for more details on how to modify this file.&#x20;
* Secret
  * A kubeconfig secret that contains all contexts that should be included in the Troubleshooting Cheat Sheet. This is typically a user or service account that has view-only access to the resources you wish to be included in the Troubleshooting Cheat Sheet.&#x20;

Example deployment manifests (as used in the online demo environment) are in the [runwhen-local GitHub repo](https://github.com/runwhen-contrib/runwhen-local/tree/main/deploy/kubernetes). There is an all-in-one.yaml manifest that provides the fastest path to deployment.&#x20;

### Deploying the manifests

In order to use the all-in-one.yaml manifest to deploy RunWhen Local to your Kubernetes cluster:&#x20;

```
# Customize the namespace name and path to kubeconfig as desired
namespace=runwhen-local
kubeconfig_path=~/runwhen-local/shared/kubeconfig

# Create the namespace
kubectl create ns $namespace

# Create the kubeconfig secret
kubectl create secret generic runwhen-local-kubeconfig --from-file=kubeconfig=$kubeconfig_path -n $namespace

# Create the deployment, service, and configmap
kubectl apply -f https://raw.githubusercontent.com/runwhen-contrib/runwhen-local/main/deploy/kubernetes/all-in-one.yaml -n $namespace
```

{% hint style="warning" %}
It might take a few minutes for discovery to complete. In some cases, the API server isn't available right away when the discovery attempts to start and this may delay the initial scan until the `AUTORUN_WORKSPACE_BUILDER_INTERVAL` has passed.&#x20;
{% endhint %}

#### Testing the RunWhen Local Deployment

If you should choose to deploy an ingress object (or loadbalancer type service) with an accessible URL or dedicated IP address, you can simply navigate to that URL to validate the functionality.&#x20;

Without an ingress object or loadbalancer IP address, you can use the following command to validate functionality:&#x20;

```
kubectl port-forward svc/runwhen-local 8081:8081 -n $namespace
```

With the service available on your local machine, you can access the interface by opening a browser to [http://localhost:8081](http://localhost:8081)

<figure><img src="assets/gs_k8s_view_cheat_sheet.png" alt=""><figcaption></figcaption></figure>