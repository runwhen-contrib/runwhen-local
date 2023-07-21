<p align="center">
  <a href="https://discord.gg/es7rexdG">
    <img src="https://img.shields.io/discord/1131539039665791077?label=Join%20Discord&logo=discord&logoColor=white&style=for-the-badge" alt="Join Discord">
  </a>
  <a href="https://runwhen.slack.com/join/shared_invite/zt-1l7t3tdzl-IzB8gXDsWtHkT8C5nufm2A">
    <img src="https://img.shields.io/badge/Join%20Slack-%23E01563.svg?&style=for-the-badge&logo=slack&logoColor=white" alt="Join Slack">
  </a>
</p>

# Welcome to RunWhen Local

> Note: RunWhen Local documentation is hosted [here](https://docs.runwhen.com/public/runwhen-local/introduction-runwhen-local)

![RunWhen Local Overview](assets/rw-local-product.png)


## What Is it?
We all have complex CLI commands saved in a file or wiki somewhere that are helpful, but constantly need to be adapted, or are difficult to find when we need them.

RunWhen Local is a container that provides a searchable web interface that provides helpful copy & paste CLI commands for troubleshooting apps deployed to your Kubernetes environment from an open source community of DevOps/Platform/SRE engineers. Oh yeah, and it's FOSS. 
- You run the container
- It scans your clusters
- It finds the right troubleshooting commands that match your resources
- And delivers troubleshooting commands that you can copy and paste


## Who is it for?
Anyone that is working on, or in, Kubernetes environments might find RunWhen Local helpful.
- Kubernetes administrators
- Kubernetes application developers
- L1/L2/L3 Support teams that manage Kubernetes environments 


## Where can I see it?
There are a few ways to see if this is interesting to you:
- Checkout out our live demo instance here: https://runwhen-local.sandbox.runwhen.com/
    - Note: It's pointed at our sandbox cluster, and so the commands are tailored for that environment.
- Check out our YouTube Channel with short demo videos
- [Run it yourself](https://docs.runwhen.com/public/runwhen-local/getting-started)

## Want to Contribute? Have an awesome troubleshooting command to share?
If you want to get involved in the community: 
- [Report bugs or share feedback](https://github.com/runwhen-contrib/runwhen-local/issues/new?assignees=stewartshea&labels=runwhen-local&projects=&template=runwhen-local-feedback.md&title=%5Brunwhen-local-feedback%5D+)
- [Contribute and awesome troubleshooting command](https://github.com/runwhen-contrib/runwhen-local/issues/new?assignees=stewartshea&labels=runwhen-local%2Cawesome-command-contribution&projects=&template=awesome-command-contribution.yaml&title=%5Bawesome-command-contribution%5D+)
- [Need a new command? Ask the community for help](https://github.com/runwhen-contrib/runwhen-local/issues/new?assignees=stewartshea&labels=runwhen-local%2Cnew-command-request&projects=&template=commands-wanted.yaml&title=%5Bnew-command-request%5D+)
- [Get involved in GitHub Discussions](https://github.com/orgs/runwhen-contrib/discussions)

  
## Connect with Us
Want to connect with the RunWhen community, [join us on slack](https://runwhen.slack.com/join/shared_invite/zt-1l7t3tdzl-IzB8gXDsWtHkT8C5nufm2A) or on [Discord](https://discord.com/invite/es7rexdG)

## What is the future of RunWhen Local?
RunWhen Local will be officially FOSS in the next few sprints (e.g. better contributor guides, and the main code base added to the repo). 

What's the hold up? 
- Just like we shower every day, the code could use a little cleaning
- A major code organizational change needs to be implemented with regards to matching discovered resources with troubleshooting code. Currently these rules reside in the container image, but they need to be migrated to the code repositores and alongside the troubleshooting code itself. 

It will continue to become more useful as the open source community of troubleshooting contributions grows and as we add more indexing capabilities (such as discovering more Kubernetes resources, or cloud resources from AWS, GCP, and Azure).

In the meanwhile, we continue to add new features and troubleshooting code. Please raise issues to request features or contribute commands!

## Release Notes
Short release notes are posted [here](https://docs.runwhen.com/public/runwhen-local-features/release-notes) until all code is migrated to this repository. 