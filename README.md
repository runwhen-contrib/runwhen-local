
<p align="center">
  <a href="https://discord.com/invite/Ut7Ws4rm8Q">
    <img src="https://img.shields.io/discord/1131539039665791077?label=Join%20Discord&logo=discord&logoColor=white&style=for-the-badge" alt="Join Discord">
  </a>
  <a href="https://runwhen.slack.com/join/shared_invite/zt-1l7t3tdzl-IzB8gXDsWtHkT8C5nufm2A">
    <img src="https://img.shields.io/badge/Join%20Slack-%23E01563.svg?&style=for-the-badge&logo=slack&logoColor=white" alt="Join Slack">
  </a>
  <br>
    <img src="https://github.com/runwhen-contrib/runwhen-local/actions/workflows/merge_to_main.yaml/badge.svg" alt="Join Slack">
</p>

> Note: RunWhen Local user documentation and getting started guide is hosted [here](https://docs.runwhen.com/public/runwhen-local/introduction-runwhen-local)

![RunWhen Local Overview](assets/rw-local-product.png)

<!-- TOC -->

- [Welcome to RunWhen Local!](#welcome-to-runwhen-local)
- [Who Can Benefit?](#who-can-benefit)
- [Where Can You See It in Action?](#where-can-you-see-it-in-action)
- [How You Can Contribute](#how-you-can-contribute)
    - [Expanding the Troubleshooting Library](#expanding-the-troubleshooting-library)
        - [Contribute to Existing Libraries](#contribute-to-existing-libraries)
        - [Create Your Own Library](#create-your-own-library)
        - [Share New Commands or Enhance Existing Ones](#share-new-commands-or-enhance-existing-ones)
    - [Improving RunWhen Local](#improving-runwhen-local)
- [Connect with the RunWhen Community](#connect-with-the-runwhen-community)
- [Check Out Our Documentation](#check-out-our-documentation)
- [What's on the Horizon?](#whats-on-the-horizon)
    - [Major Goals](#major-goals)
    - [Ongoing Enhancements](#ongoing-enhancements)
- [Stay Updated with Release Notes](#stay-updated-with-release-notes)

<!-- /TOC -->


## Welcome to RunWhen Local!

Are you tired of searching through files and wikis for those elusive CLI commands that come in handy but always need tweaking? 

**RunWhen Local** is like your personal troubleshooter's toolbox. It's a friendly container that offers an easy-to-use web interface, filled with helpful copy & paste CLI commands specifically designed to troubleshoot applications in your Kubernetes environment. And guess what? It's open-source! Here's how it works:

1. You launch the container.
2. It scans your clusters.
3. It identifies the perfect troubleshooting commands tailored to your resources.
4. You simply copy and paste the commands to help solve your issues!

![](assets/trouble-town-ingress.gif)

## Who Can Benefit?

If you're involved with Kubernetes environments, RunWhen Local could be for you. It's designed for:

- Kubernetes administrators
- Kubernetes application developers
- Support teams working with Kubernetes

## Where Can You See It in Action?

Curious to see it in action? We've got a few options for you:

- Check out our live demo instance [here](https://runwhen-local.sandbox.runwhen.com/). Please note that it's linked to our sandbox cluster, so the commands are suited for that environment.
- Explore our [YouTube Channel](https://www.youtube.com/@whatdoirunwhen) with short demo videos.
- Ready to dive in? [Run it yourself](https://docs.runwhen.com/public/runwhen-local/getting-started).

## How You Can Contribute

We love when the community gets involved! There are two main ways you can contribute:

### Expanding the Troubleshooting Library

#### Contribute to Existing Libraries

Our troubleshooting library is fully open-source and welcomes contributions. You can contribute directly to these repositories:

- [RunWhen CLI Codecollection](https://github.com/runwhen-contrib/rw-cli-codecollection)

For more details, check out the contribution guides within each repo.

#### Create Your Own Library

Interested in maintaining your own code collection and being rewarded for your efforts? Learn more about the [RunWhen Author Program](https://docs.runwhen.com/public/runwhen-authors/getting-started-with-codecollection-development).

#### Share New Commands or Enhance Existing Ones

Join the community by:

- [Contributing an awesome troubleshooting command](https://github.com/runwhen-contrib/runwhen-local/issues/new?assignees=stewartshea&labels=runwhen-local%2Cawesome-command-contribution&projects=&template=awesome-command-contribution.yaml&title=%5Bawesome-command-contribution%5D+)
- [Requesting a new command](https://github.com/runwhen-contrib/runwhen-local/issues/new?assignees=stewartshea&labels=runwhen-local%2Cnew-command-request&projects=&template=commands-wanted.yaml&title=%5Bnew-command-request%5D+)
- Engaging in discussions on [GitHub Discussions](https://github.com/orgs/runwhen-contrib/discussions).

### Improving RunWhen Local

Your ideas matter! Help us enhance the tool:

- [Report bugs or share feedback](https://github.com/runwhen-contrib/runwhen-local/issues/new?assignees=stewartshea&labels=runwhen-local&projects=&template=runwhen-local-feedback.md&title=%5Brunwhen-local-feedback%5D+)
- Want to make your own changes? [Read the CONTRIBUTING documentation](./CONTRIBUTING.md), [fork the repo](https://github.com/runwhen-contrib/runwhen-local/fork), and [explore the DEVELOPMENT documentation](docs/DEVELOPMENT.md).

## Connect with the RunWhen Community

We're a friendly bunch! Connect with us on:

- [Slack](https://runwhen.slack.com/join/shared_invite/zt-1l7t3tdzl-IzB8gXDsWtHkT8C5nufm2A)
- [Discord](https://discord.com/invite/Ut7Ws4rm8Q)

## Check Out Our Documentation

For more details, dive into our [documentation](docs/):

- [Architecture](docs/ARCHITECTURE.md)
- [Development](docs/DEVELOPMENT.md)

## What's on the Horizon?

We've got exciting plans ahead! Here's a sneak peek at what's coming:

### Major Goals

- Introducing indexers for various cloud resources (GCP, AWS, Azure)
- [Streamlining the tool's size & complexity by removing Neo4j](https://github.com/runwhen-contrib/runwhen-local/issues/249)

### Ongoing Enhancements

We're also working on:

- Robust CI/CD: Sandbox deployment validation for PRs
- Expanding our library of troubleshooting commands (always more to come!)
- Improved contribution guides
- Detailed low-level documentation

In the meantime, we're constantly adding features and troubleshooting code. Feel free to raise issues for new features or contribute your own commands!

Check out the [GitHub Project](https://github.com/orgs/runwhen-contrib/projects/2) for ongoing roadmap updates. 

## Stay Updated with Release Notes

Catch up on our latest updates in the [release notes](https://github.com/runwhen-contrib/runwhen-local/releases).

Welcome to RunWhen Local – your go-to troubleshooter's companion! 🚀
