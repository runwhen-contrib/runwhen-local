# Introduction

[![Join Slack](https://img.shields.io/badge/Join%20Slack-%23E01563.svg?\&style=for-the-badge\&logo=slack\&logoColor=white)](https://runwhen.slack.com/join/shared\_invite/zt-1l7t3tdzl-IzB8gXDsWtHkT8C5nufm2A)\
![](https://github.com/runwhen-contrib/runwhen-local/actions/workflows/merge\_to\_main.yaml/badge.svg) [![Artifact Hub](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/runwhen-contrib)](https://artifacthub.io/packages/search?repo=runwhen-contrib)

![RunWhen Local Overview](../assets/rw-local-product.png)

* [Welcome to RunWhen Local!](./#welcome-to-runwhen-local)
* [Who Can Benefit?](./#who-can-benefit)
* [Where Can You See It in Action?](./#where-can-you-see-it-in-action)
* [How Can I Get It?](./#how-can-i-get-it)
* [How You Can Contribute](./#how-you-can-contribute)
  * [Expanding the Troubleshooting Library](./#expanding-the-troubleshooting-library)
    * [Contribute to Existing Libraries](./#contribute-to-existing-libraries)
    * [Create Your Own Library](./#create-your-own-library)
    * [Share New Commands or Enhance Existing Ones](./#share-new-commands-or-enhance-existing-ones)
  * [Improving RunWhen Local](./#improving-runwhen-local)
* [Connect with the RunWhen Community](./#connect-with-the-runwhen-community)
* [Check Out Our Documentation](./#check-out-our-documentation)
* [Stay Updated with Release Notes](./#stay-updated-with-release-notes)

### Welcome to RunWhen Local!

Are you tired of searching through files and wikis for those elusive CLI commands that come in handy but always need tweaking?

**RunWhen Local** is like your personal troubleshooter's toolbox. It's a friendly container that offers an easy-to-use web interface, filled with helpful copy & paste CLI commands specifically designed to troubleshoot applications in your Kubernetes environment. And guess what? It's open-source! Here's how it works:

1. You launch the container.
2. It scans your clusters.
3. It identifies the perfect troubleshooting commands tailored to your resources.
4. You simply copy and paste the commands to help solve your issues!

![](../assets/trouble-town-ingress.gif)

### Can it Automatically Run These Commands?

Yes, but only when connected to the RunWhen Platform SaaS service. RunWhen Local can be installed in Kubernetes, connected to the RunWhen Platform, with self-hosted private runners. In this configuration, your RunWhen Workspace is automatically updated with:&#x20;

* newly discovered cloud resources
* automation tasks
* troubleshooting tasks
* health checks
* workflows
* SLI and SLO alerting&#x20;
* and much more!

See [www.runwhen.com](https://www.runwhen.com) or [docs.runwhen.com](https://docs.runwhen.com) for more details, or jump to [kubernetes\_self\_hosted\_runner](installation/kubernetes\_self\_hosted\_runner/ "mention") for more details on this installation option.&#x20;

### Who Can Benefit?

If you're involved with **Kubernetes** or **Public Cloud** environments, RunWhen Local could be for you. It's designed for:

* Kubernetes administrators
* Kubernetes application developers
* Support teams working with Kubernetes
* Cloud infrastructure teams in GCP, AWS, or Azure
* Public cloud administrators managing workloads or services
* Anyone needing help troubleshooting cloud-based services

### Where Can You See It in Action?

Curious to see it in action? We've got a few options for you:

* Check out our live demo instance [here](https://runwhen-local.sandbox.runwhen.com/). Please note that it's linked to our sandbox cluster, so the commands are suited for that environment.
* Explore our [YouTube Channel](https://www.youtube.com/@whatdoirunwhen) with short demo videos in this [playlist](https://www.youtube.com/playlist?list=PLq37As8dgg\_C0wFaPQLVUFQ79YiQjzHGU)
* Want to check out the RunWhen Platform? We have tutorials that you can play with right in our sandbox cluster. Click [here](https://docs.runwhen.com/public/runwhen-platform/tutorials). Sign in. Play.&#x20;

### How Can I Get It?

Ready to dive in? [Run it yourself](https://docs.runwhen.com/public/v/runwhen-local/user-guide/getting-started).

### How You Can Contribute

We love when the community gets involved! There are two main ways you can contribute:

#### Expanding the Troubleshooting Library

**Contribute to Existing Libraries**

Our troubleshooting library is fully open-source and welcomes contributions. You can contribute directly to any of the CodeCollection libraries hosted in our [Registry](https://registry.runwhen.com).&#x20;



For more details, check out the contribution guides within each repo.

**Create Your Own Library**

Interested in maintaining your own code collection and being rewarded for your efforts? Learn more about the [RunWhen Author Program](https://docs.runwhen.com/public/runwhen-authors/getting-started-with-codecollection-development).



**Share New Commands or Enhance Existing Ones**

Join the community by:

* [Contributing an awesome troubleshooting command](https://github.com/runwhen-contrib/runwhen-local/issues/new?assignees=stewartshea\&labels=runwhen-local%2Cawesome-command-contribution\&projects=\&template=awesome-command-contribution.yaml\&title=%5Bawesome-command-contribution%5D+)
* [Requesting a new command](https://github.com/runwhen-contrib/runwhen-local/issues/new?assignees=stewartshea\&labels=runwhen-local%2Cnew-command-request\&projects=\&template=commands-wanted.yaml\&title=%5Bnew-command-request%5D+)
* Engaging in discussions on [GitHub Discussions](https://github.com/orgs/runwhen-contrib/discussions).

#### Improving RunWhen Local

Your ideas matter! Help us enhance the tool:

* [Report bugs or share feedback](https://github.com/runwhen-contrib/runwhen-local/issues/new?assignees=stewartshea\&labels=runwhen-local\&projects=\&template=runwhen-local-feedback.md\&title=%5Brunwhen-local-feedback%5D+)
* Want to make your own changes? [Read the CONTRIBUTING documentation](../CONTRIBUTING.md), [fork the repo](https://github.com/runwhen-contrib/runwhen-local/fork), and [explore the DEVELOPMENT documentation](DEVELOPMENT.md).

### Connect with the RunWhen Community

We're a friendly bunch! Connect with us on:

* [Slack](https://runwhen.slack.com/join/shared\_invite/zt-1l7t3tdzl-IzB8gXDsWtHkT8C5nufm2A)

### Check Out Our Documentation

All documentation is stored in [/docs](https://github.com/runwhen-contrib/runwhen-local/tree/main/docs), but is also rendered by GitBook [here](https://docs.runwhen.com/public/v/runwhen-local/).

* [User Guide](https://docs.runwhen.com/public/v/runwhen-local/user-guide/)
* [Architecture](https://docs.runwhen.com/public/v/runwhen-local/architecture)
* [Development](https://docs.runwhen.com/public/v/runwhen-local/development/)
* [Kubernetes LOD Configuration](./kubernetes-lod-index.md) - Configure resource discovery across multiple clusters

### Stay Updated with Release Notes

Catch up on our latest updates in the [release notes](https://github.com/runwhen-contrib/runwhen-local/releases).

Welcome to RunWhen Local – your go-to troubleshooter's companion! 🚀
