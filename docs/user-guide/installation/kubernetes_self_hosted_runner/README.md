---
description: >-
  Deploy RunWhen Local  and the self-hosted Runner and integrate them with a
  RunWhen Workspace.
---

# Kubernetes - With the RunWhen Platform

{% hint style="info" %}
This installation method is for for users of the RunWhen Platform running in a hybrid deployment model.&#x20;
{% endhint %}

In this method, RunWhen Local installs with the additional self-hosted runner components. The self-hosted runner is an agent that is deployed within your infrastructure that runs and executes [CodeBundles](https://docs.runwhen.com/public/runwhen-platform/feature-overview/code-bundles)   (managed and controlled by the RunWhen Platform).&#x20;

### Create a RunWhen Platform Workspace

* Log into the [app](https://app.beta.runwhen.com)
* Create a new workspace

<figure><img src="../../../.gitbook/assets/image (9).png" alt=""><figcaption></figcaption></figure>



### Install RunWhen Local with the Self-Hosted Runner

Using a Helm manager of choice, deploy an instance of RunWhen Local with the Runner enabled:&#x20;

```
namespace=<namespace/project name>
workspace=<my-runwhen-workspace>

helm repo add runwhen-contrib https://runwhen-contrib.github.io/helm-charts
helm repo update
helm install runwhen-local runwhen-contrib/runwhen-local  \
	--set workspaceName=$workspace \
	--set runner.enabled=true \
	-n $namespace
```

{% hint style="info" %}
With the helm deployment settings above. the kubeconfig created to discover and interact with your cluster resources is stored on your cluster locally. It is never sent to the RunWhen Platform.&#x20;
{% endhint %}

Please see [this link ](https://github.com/runwhen-contrib/helm-charts/blob/9fe6a5e778201e530f49e2ddc804206ec551a272/charts/runwhen-local/values.yaml#L186)for the runner specific helm chart values.

The Runner installation consists of 3 or more pods:&#x20;

* runner (the main control point for communicating with the RunWhen Platform)
* metrics pods (used for sending SLI and Task metric data to the RunWhen Platform)
  * grafana-agent
  * pushgateway
* Additional pods (with a UUID naming convention) that are created and removed as needed. These pods execute the SLI and Taslk CodeBundles as instructed from the RunWhen platform.&#x20;

### Register the Self-Hosted Runner with the RunWhen Platform

* From the workspace creation wizard, select **Register a Runner** (alternatively, if the wizard is gone, this can be performed from Configuration -> Workspace -> Admin Tools)
* Select a helpful and unique name for your the self-hosted runner (often referred to as a **location**)
* Apply the secret into the namespace and the `runner` pod will pick it up and begin the registration process

<figure><img src="../../../.gitbook/assets/image (10).png" alt=""><figcaption></figcaption></figure>

```
kubectl create secret generic runner-registration-token --from-literal=token="[TOKEN]" -n $namespace
```



### Run Discovery & Upload Results

* From the workspace creation wizard, select **Generate Upload Configuration** (alternatively, if the wizard is gone, this can be performed from Configuration -> Workspace -> Admin Tools)
* Port-forward the RunWhen Local UI (or leverage an ingress object) to access the Upload Configuration Screen

```
kubectl port-forward deployment/runwhen-local 8081:8081 -n $namespace
```

* Navigate to [http://127.0.0.1:8081/platform-upload/](http://127.0.0.1:8081/platform-upload/)
* Select **Upload Configuration**

<figure><img src="../../../.gitbook/assets/image (11).png" alt=""><figcaption></figcaption></figure>

### Visit the Workspace Map in the RunWhen Platform

* Once the content has uploaded, the Workspace Map will begin to render
* All self-hosted runner pods should be functioning, and new pods should start up - each of these pods running pre-configured tasks from the auto-generated map

<figure><img src="../../../.gitbook/assets/image (12).png" alt=""><figcaption></figcaption></figure>

### What Happens Next?

It may take a little time for the new workspace to index all of the tasks and objects that were created:&#x20;

<figure><img src="../../../.gitbook/assets/image (14).png" alt="" width="375"><figcaption></figcaption></figure>

While this is taking place, we suggest:&#x20;

* Add team members to your workspace

<figure><img src="../../../.gitbook/assets/image (19).png" alt=""><figcaption></figcaption></figure>

* Check out the [interactive tutorials](https://docs.runwhen.com/public/runwhen-platform/tutorials) to learn more about interacting with the [Map](https://docs.runwhen.com/public/runwhen-platform/feature-overview/maps), [Digital Assistants](https://docs.runwhen.com/public/runwhen-platform/terms-and-concepts#digital-assistant)[,](https://docs.runwhen.com/public/runwhen-platform/feature-overview/digital-assistants) and[ RunSessions](https://docs.runwhen.com/public/runwhen-platform/feature-overview/runsessions)&#x20;

<figure><img src="../../../.gitbook/assets/image (18).png" alt=""><figcaption></figcaption></figure>

