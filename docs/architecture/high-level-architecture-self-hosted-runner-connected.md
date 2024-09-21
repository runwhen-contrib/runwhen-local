# High Level Architecture - Self-Hosted Runner (Connected)

## High-Level Architecture

When deployed in the [kubernetes\_self\_hosted\_runner](../installation/kubernetes\_self\_hosted\_runner/ "mention") option, additional components are deployed alongside the RunWhen Local container image.&#x20;



### Automated Workspace Configuration

In this deployment model, the RunWhen Local container image is configured to perform the discovery, configuration, and upload tasks on a regular schedule - keeping the RunWhen Platform Workspace up to date.&#x20;

<figure><img src="../.gitbook/assets/PoC Flow Concepts-Automatic Workspace Configuration.drawio.png" alt=""><figcaption><p>Automatic Workspace Configuration</p></figcaption></figure>



### Self-Hosted Runner Components

In addition, a self-hosted runner is connected to the RunWhen Platform such that it can perform all tasks in a secure and private manner without the need for external network connectivity. A self-hosted runner should be deployed in any network zone where tasks need to be executed.&#x20;

<figure><img src="../.gitbook/assets/PoC Flow Concepts-Private Task Execution.drawio.png" alt=""><figcaption><p>Self-Hosted Runner Architecture</p></figcaption></figure>

