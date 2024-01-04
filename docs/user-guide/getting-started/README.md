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

### Deployment Options

RunWhen Local is distributed as a container image and can be deployed:&#x20;

* Locally on your laptop/PC with Docker/Podman
* In Kubernetes via manifests or Helm

### Choosing a Deployment Method

Consider the following when determining which deployment method is best for you:&#x20;

|                   | Locally (Docker/Podman)                                                                                                                              | Kubernetes (Helm)                                                                                                                                                                                                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Discovery         | <ul><li>Kubernetes: Discovers any resources that the user has access to</li><li>Discovery is started from the UI or command line as needed</li></ul> | <ul><li><p>Kubernetes: Discovery defaults to all resources in the local cluster using an automatically created service account</p><ul><li>Easily overridden with a user-provided  secret</li></ul></li><li>Discovery is regularly run on a configured interval</li></ul> |
| CheatSheet Access | <ul><li>Locally accessible via http://localhost:8081 </li><li>Not easily shared with other team members</li></ul>                                    | <ul><li>Can shared with team members <a data-footnote-ref href="#user-content-fn-1">if exposed with an ingress object</a></li></ul>                                                                                                                                      |
| Features          | <ul><li>In-Browser Terminal: <a data-footnote-ref href="#user-content-fn-2">Enabled by default</a></li></ul>                                         | <ul><li>In-browser Terminal: <a data-footnote-ref href="#user-content-fn-3">Disabled by default</a> </li></ul>                                                                                                                                                           |
| Intended Audience | <ul><li>Developers with limited scope to application level resources</li></ul>                                                                       | <ul><li>Cluster admins / platform admins / DevOps engineers supporting platform level and application level resources</li></ul>                                                                                                                                          |





### Deployment Instructions

<table data-card-size="large" data-view="cards"><thead><tr><th align="center"></th><th align="center"></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td align="center"><img src="../../.gitbook/assets/Untitled Diagram-Page-2.drawio (1) (2).png" alt=""></td><td align="center">Running Locally</td><td><a href="../../Getting_Started-Running_Locally.md">Getting_Started-Running_Locally.md</a></td></tr><tr><td align="center"><img src="../../.gitbook/assets/Untitled Diagram-Page-3.drawio (2).png" alt=""></td><td align="center">Running In Kubernetes</td><td><a href="../../Getting_Started-Running_in_Kubernetes.md">Getting_Started-Running_in_Kubernetes.md</a></td></tr></tbody></table>

[^1]: This is disabled by default since you may not want to share the discovery results with anyone that has access to the url.&#x20;

[^2]: It's your own instance, using your own access - use the terminal as if it's your own

[^3]: You might not want to share the kubeconfig access with other users
