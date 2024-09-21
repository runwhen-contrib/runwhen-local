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



**Getting Started with RunWhen Local**

To begin using RunWhen Local, first choose your preferred deployment method:

#### Deployment Options

RunWhen Local is distributed as a container image and can be deployed in the following ways:

1. **In Kubernetes via Helm (Connected)**
   * This method integrates a self-hosted runner, which executes health checks, troubleshooting, and automation tasks on behalf of the RunWhen Platform SaaS.
2. **Standalone (Disconnected Mode)**
   * RunWhen Local can also be deployed to provide resource discovery and the Troubleshooting Cheat Sheet, but without any connection or interaction with the RunWhen Platform service.

#### Which deployment method is right for you?

* **I want to use the RunWhen Platform**\
  If you need Engineering Assistants that can automatically suggest and run tasks privately and securely in your own environment, and you want a collaborative workspace for troubleshooting and operational automation tasks with your team, then the [kubernetes\_self\_hosted\_runner](../installation/kubernetes\_self\_hosted\_runner/ "mention") option is right for you.



* **I just want a cheat sheet of automatically generated troubleshooting commands from a community of smart engineers**
  * Want to run it in Kubernetes? The [kubernetes\_standalone.md](../installation/kubernetes\_standalone.md "mention") is for you.
  * Prefer to run it on your laptop? The [getting\_started-running\_locally.md](../installation/getting\_started-running\_locally.md "mention") is your best choice.

