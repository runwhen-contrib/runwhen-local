---
description: >-
  Deploy RunWhen Local  and the self-hosted Runner and integrate them with a
  RunWhen Workspace.
---

# Kubernetes Self-Hosted Runner (Connected)

{% hint style="info" %}
This installation method is for for users of the [RunWhen Platform](https://docs.runwhen.com) running in a hybrid deployment model.
{% endhint %}

<figure><img src="../../.gitbook/assets/flow (2).png" alt=""><figcaption></figcaption></figure>

## Create a RunWhen Platform Workspace

[![](../../.gitbook/assets/login\_create\_workspace.png)](https://app.beta.runwhen.com/?addWorkspace=true%3C)

<figure><img src="../../.gitbook/assets/image (9).png" alt=""><figcaption></figcaption></figure>

## Install RunWhen Local with the Self-Hosted Runner

Using a Helm manager of choice, deploy an instance of RunWhen Local with the Runner enabled:

{% tabs %}
{% tab title="Helm Installation" %}
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
{% endtab %}

{% tab title="Helm Installation with Proxies" %}
```
namespace=<namespace/project name>
workspace=<my-runwhen-workspace>

helm repo add runwhen-contrib https://runwhen-contrib.github.io/helm-charts
helm repo update
helm install runwhen-local runwhen-contrib/runwhen-local  \
	--set workspaceName=$workspace \
	--set proxy.enabled=true \
	--set proxy.httpProxy=<proxy> \
	--set proxy.httpsProxy=<proxy> \
	--set proxy.noProxy: 127.0.0.1,localhost,$(KUBERNETES_SERVICE_HOST),pushgateway \
	--set proxyCA.key=<ca.crt> \
	--set proxyCA.secretName: <secretname> \
	--set runner.runEnvironment.proxy.noProxy=127.0.0.1,localhost,$(KUBERNETES_SERVICE_HOST),pushgateway \
	--set grafana-agent.agent.mounts.extra[1].mountPath=/etc/ssl/certs/proxy-ca.crt \
	--set grafana-agent.agent.mounts.extra[1].name=proxy-ca-volume \
	--set grafana-agent.agent.mounts.extra[1].readOnly=true \
	--set grafana-agent.agent.mounts.extra[1].subPath=proxy-ca.crt \
	--set grafana-agent.controller.volumes.extra[1].name=proxy-ca-volume \
	--set grafana-agent.controller.volumes.extra[1].secret.items[0].key=ca.crt \
	--set grafana-agent.controller.volumes.extra[1].secret.items[0].path=proxy-ca.crt \
	--set grafana-agent.controller.volumes.extra[1].secret.secretName=<proxy-tls-secret> \
	--set runner.enabled=true \
	-n $namespace
```
{% endtab %}

{% tab title="Helm Installation in OpenShift" %}
```
namespace=<namespace/project name>
workspace=<my-runwhen-workspace>

helm repo add runwhen-contrib https://runwhen-contrib.github.io/helm-charts
helm repo update
helm install runwhen-local runwhen-contrib/runwhen-local  \
	--set workspaceName=$workspace \
	--set runwhenLocal.workspaceInfo.configMap.data.custom.kubernetes_distribution_binary=oc \
	--set runner.enabled=true \
	-n $namespace
```

{% hint style="warning" %}
If you are installing into OpenShift with a restricted user account, the following command is necessary in order to permit RunWhen Local to discover resources in it's own project.

```
oc adm policy add-role-to-user view system:serviceaccount:$namespace:runwhen-local -n $namespace
```
{% endhint %}
{% endtab %}
{% endtabs %}

{% hint style="info" %}
With the helm deployment settings above. the kubeconfig created to discover and interact with your cluster resources is stored on your cluster locally. It is never sent to the RunWhen Platform. By default, the service account is given cluster view permissions, but can easily be substituted with a custom kubeconfig. See [Generating Service Accounts and Kubeconfigs ](https://docs.runwhen.com/public/runwhen-platform/guides/kubernetes-environments/generating-service-accounts-and-kubeconfigs)for more details.
{% endhint %}

Please see [this link](https://github.com/runwhen-contrib/helm-charts/blob/main/charts/runwhen-local/values.yaml) for the runner specific helm chart values. Also see [workspaceinfo-customization.md](../../configuration/workspaceinfo-customization.md "mention") for details on customizing the discovery process, including the discovery of resources outside from Azure, AWS, or GCP.

The Runner installation consists of 3 or more pods:

* runner (the main control point for communicating with the RunWhen Platform)
* metrics pods (used for sending SLI and Task metric data to the RunWhen Platform)
  * grafana-agent
  * pushgateway
* Additional pods (with a UUID naming convention) that are created and removed as needed. These pods execute the SLI and Taslk CodeBundles as instructed from the RunWhen platform.

### Register the Self-Hosted Runner with the RunWhen Platform

* From the workspace creation wizard, select **Register a Runner** (alternatively, if the wizard is gone, this can be performed from Configuration -> Workspace -> Admin Tools)
* Select a helpful and unique name for your the self-hosted runner (often referred to as a **location**)
* Apply the secret into the namespace and the `runner` pod will pick it up and begin the registration process

<figure><img src="../../.gitbook/assets/image (10).png" alt=""><figcaption></figcaption></figure>

```
kubectl create secret generic runner-registration-token --from-literal=token="[TOKEN]" -n $namespace
```

## Run Discovery & Upload Results

* From the workspace creation wizard, select **Generate Upload Configuration** (alternatively, if the wizard is gone, this can be performed from Configuration -> Workspace -> Admin Tools)

{% tabs %}
{% tab title="From the Web UI" %}
* Port-forward the RunWhen Local UI (or leverage an ingress object) to access the Upload Configuration Screen

```
kubectl port-forward deployment/runwhen-local 8081:8081 -n $namespace
```

* Navigate to [http://127.0.0.1:8081/platform-upload/](http://127.0.0.1:8081/platform-upload/)
* Select **Upload Configuration**

<figure><img src="../../.gitbook/assets/image (11).png" alt=""><figcaption></figcaption></figure>


{% endtab %}

{% tab title="From the CLI" %}
* Create a secret in the namespace with the contents of uploadInfo.yaml (ensure to update the file name accordingly)

```
kubectl create secret generic uploadinfo --from-file=uploadInfo.yaml="[DOWNLOADED FILE]" -n $namespace
```

* Upgrade Helm to use this secret and enable upload

{% hint style="warning" %}
Ensure to keep all of your previously modified values, or merge in the following settings into the values.yaml file
{% endhint %}

```
helm install runwhen-local runwhen-contrib/runwhen-local  \
	--set workspaceName=$workspace \
	--set runner.enabled=true \
	--set runwhenLocal.uploadInfo.secretProvided.enabled=true \
	--set runwhenLocal.uploadInfo.secretProvided.secretName=uploadinfo \
	--set runwhenLocal.uploadInfo.secretProvided.secretKey=uploadInfo.yaml \
	--set runwhenLocal.uploadInfo.secretProvided.secretPath=uploadInfo.yaml \
	--set runwhenLocal.autoRun.uploadEnabled=true \
	-n $namespace
```
{% endtab %}
{% endtabs %}



### Visit the Workspace Map in the RunWhen Platform

* Once the content has uploaded, the Workspace Map will begin to render
* All self-hosted runner pods should be functioning, and new pods should start up - each of these pods running pre-configured tasks from the auto-generated map

<figure><img src="../../.gitbook/assets/image (12).png" alt=""><figcaption></figcaption></figure>

### What Happens Next?

It may take a little time for the new workspace to index all of the tasks and objects that were created:

<figure><img src="../../.gitbook/assets/image (14).png" alt="" width="375"><figcaption></figcaption></figure>

While this is taking place, we suggest:

* Add team members to your workspace

<figure><img src="../../.gitbook/assets/image (19).png" alt=""><figcaption></figcaption></figure>

* Check out the [interactive tutorials](https://docs.runwhen.com/public/runwhen-platform/tutorials) to learn more about interacting with the [Map](https://docs.runwhen.com/public/runwhen-platform/feature-overview/maps), [Digital Assistants](https://docs.runwhen.com/public/runwhen-platform/terms-and-concepts#digital-assistant)[,](https://docs.runwhen.com/public/runwhen-platform/feature-overview/digital-assistants) and[ RunSessions](https://docs.runwhen.com/public/runwhen-platform/feature-overview/runsessions)

<figure><img src="../../.gitbook/assets/image (18).png" alt=""><figcaption></figcaption></figure>
