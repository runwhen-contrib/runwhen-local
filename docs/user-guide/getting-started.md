---
layout:
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
---

# Getting Started

Getting started with RunWhen Local starts with choosing a deployment option:&#x20;

### Deployment Options

RunWhen Local is distributed as a container image and can be deployed:&#x20;

* In Kubernetes via manifests or Helm
  * [getting\_started-running\_in\_kubernetes.md](installation/getting\_started-running\_in\_kubernetes.md "mention") provides the Troubleshooting Cheat Sheet, but is not connected to, and does not interact with, the [RunWhen Platform](https://docs.runwhen.com/public) service.&#x20;
  * [Broken link](broken-reference "mention") additionally provides the self-hosted runner which executes health checks and troubleshooting tasks on behalf of the RunWhen Platform SaaS.&#x20;
* [getting\_started-running\_locally.md](installation/getting\_started-running\_locally.md "mention")  provides the Troubleshooting Cheat Sheet, but is not connected to, and does not interact with, the [RunWhen Platform](https://docs.runwhen.com/public) service.&#x20;

<table data-card-size="large" data-view="cards"><thead><tr><th align="center"></th><th align="center"></th><th data-hidden data-card-target data-type="content-ref"></th><th data-hidden data-card-cover data-type="files"></th></tr></thead><tbody><tr><td align="center"><img src="../.gitbook/assets/Untitled Diagram-Page-2.drawio (1) (2).png" alt=""></td><td align="center">Installing in Docker/Podman</td><td><a href="installation/getting_started-running_locally.md">getting_started-running_locally.md</a></td><td></td></tr><tr><td align="center"><img src="../.gitbook/assets/Untitled Diagram-Page-3.drawio (2).png" alt=""></td><td align="center">Kubernetes Standalone</td><td><a href="installation/getting_started-running_in_kubernetes.md">getting_started-running_in_kubernetes.md</a></td><td></td></tr><tr><td align="center"><img src="../.gitbook/assets/Untitled Diagram-Page-3.drawio (2) (1)-Page-4.drawio (1).png" alt="" data-size="original"></td><td align="center">Kubernetes - Attached to RunWhen Platform</td><td></td><td></td></tr></tbody></table>



### Choosing a Deployment Method

Consider the following when determining which deployment method is best for you:&#x20;

|                                                                                         | Locally (Docker/Podman)                                                                                                                              | Kubernetes (Helm)                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Discovery                                                                               | <ul><li>Kubernetes: Discovers any resources that the user has access to</li><li>Discovery is started from the UI or command line as needed</li></ul> | <ul><li><p>Kubernetes: Discovery defaults to all resources in the local cluster using an automatically created service account</p><ul><li>Easily overridden with a user-provided  secret</li></ul></li><li>Discovery is regularly run on a configured interval</li></ul> |
| [user\_guide-feature\_overview.md](features/user\_guide-feature\_overview.md "mention") | <ul><li>Locally accessible via http://localhost:8081 </li><li>Not easily shared with other team members</li></ul>                                    | <ul><li>Can be shared with team members <a data-footnote-ref href="#user-content-fn-1">if exposed with an ingress object</a></li></ul>                                                                                                                                   |
| Features                                                                                | <ul><li>In-Browser Terminal: <a data-footnote-ref href="#user-content-fn-2">Enabled by default</a></li></ul>                                         | <ul><li>In-browser Terminal: <a data-footnote-ref href="#user-content-fn-3">Disabled by default</a> </li></ul>                                                                                                                                                           |
| [runner-agent](installation/runner-agent/ "mention")                                    | <ul><li>Not available</li></ul>                                                                                                                      | <ul><li>Optionally Enabled</li></ul>                                                                                                                                                                                                                                     |
| Intended Installation User                                                              | <ul><li>Developers with limited scope to application level resources</li></ul>                                                                       | <ul><li>Cluster admins / platform admins / DevOps engineers supporting platform level and application level resources</li></ul>                                                                                                                                          |





### Deployment Instructions

[^1]: This is disabled by default since you may not want to share the discovery results with anyone that has access to the url.&#x20;

[^2]: It's your own instance, using your own access - use the terminal as if it's your own

[^3]: You might not want to share the kubeconfig access with other users
