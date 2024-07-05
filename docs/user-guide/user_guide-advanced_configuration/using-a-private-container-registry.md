---
description: >-
  For environments that must pull container images from a private registry, this
  page outlines the requirements and reference scripts.
---

# Using a Private Container Registry

There are a number of container images that are used to support integration of RunWhen Local with the RunWhen Platform:&#x20;

### Core Component Images

The following container images prerequisites to perform health and troubleshooting tasks from within a private cluster. Note that the tasks themselves require the CodeCollection Images.&#x20;

| Name                   | Purpose                                                                                        | Public Container Registry                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| RunWhen Local          | Performs discovery, automatic configuration, and uploads configuration to the RunWhen Platform | ghcr.io/runwhen-contrib/runwhen-local:latest                         |
| Runner                 | an operator that connects to the RunWhen Platform and schedules/executes SLI and Tasks         | us-docker.pkg.dev/runwhen-nonprod-shared/public-images/runner:latest |
| Grafana Agent          | Scrapes SLI metrics from prometheus push gateway into RunWhen Platform                         | docker.io/grafana/agent:latest                                       |
| Prometheus Pushgateway | Accepts metrics from the SLI and is scaped from Grafana Agent                                  | docker.io/prom/pushgateway:latest                                    |





### CodeCollection Images

CodeCollection images execute health (SLI) and troubleshooting (runbook) tasks. They are built based on open source repositories that are maintained by CodeCollection Authors. Images are built based on the public git repository, branch, and tags (if appropriate). For example, the following primary CodeCollections are maintained by the RunWhen team - with the main branch being rebuilt as soon as new content is added.&#x20;

When subscribing to a branch that frequently changes, such as main, the image tag will frequently change. As a result, regular copying of the most recent image tags is necessary. See the script links below for example on how to accomplish this.&#x20;

<table><thead><tr><th width="196">Name</th><th>Purpose</th><th>Example Image</th></tr></thead><tbody><tr><td>RunWhen Public CodeCollection</td><td>Python based CodeCollections that do not leverage a command line binary or bash script. Most of these tasks are not automatically discovered</td><td>us-west1-docker.pkg.dev/runwhen-nonprod-beta/public-images/infracloudio-ifc-rw-codecollection-main:11c2ffd-ee99c37</td></tr><tr><td>RunWhen CLI CodeCollection</td><td>CodeCollections based on command line binaries and bash scripts. This is the easiest pattern to follow for importing existing scripts. </td><td>us-west1-docker.pkg.dev/runwhen-nonprod-beta/public-images/runwhen-contrib-rw-cli-codecollection-main:5316cb9-831268a</td></tr><tr><td>RunWhen Generic CodeCollection</td><td>Run Generic CLI Commands with User Input. These are best suited to ad-hoc commands that are quick to add to a workspace but do not need complex processing. </td><td>us-west1-docker.pkg.dev/runwhen-nonprod-beta/public-images/runwhen-contrib-rw-generic-codecollection-main:47e528a-831268a</td></tr></tbody></table>

{% hint style="info" %}
Check out the [CodeCollection registry ](https://registry.runwhen.com/)for more details on CodeCollections and their tasks.&#x20;
{% endhint %}



### Sample Syncronization Scripts

Since it's important that the most recent container images are available, especially for CodeCollection images, a couple of sample synchronization scripts have been added to the [RunWhen Local repository](https://github.com/runwhen-contrib/runwhen-local/tree/main/deploy/scripts/registry-sync).

* [Synchronization with Skopeo](../../../deploy/scripts/registry-sync/sync\_with\_skopeo.sh)
* [Synchronization with into Azure with az import](../../../deploy/scripts/registry-sync/sync\_with\_az\_import.sh)

These scripts should be run on a regular basis and tailored to your needs. &#x20;
