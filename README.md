
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

# Welcome to RunWhen Local

> Note: RunWhen Local user documentation and getting started guide is hosted [here](https://docs.runwhen.com/public/runwhen-local/introduction-runwhen-local)

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

## Contributing!
Want to Contribute? There are two primary ways to contribute: 
- Growing the Troubleshooting Library (More commands, more commands, more commands!)
- Making RunWhen Local Better

### Growing the troubleshooting library

#### Contribute to existing libraries
The library of troubleshooting commands is completely open source and open to contributions. The following repositories contribute to the library: 
- [RunWhen Public Codecollection](https://github.com/runwhen-contrib/rw-public-codecollection)
- [RunWhen CLI Codecollection](https://github.com/runwhen-contrib/rw-cli-codecollection)
See any of the contribution guides within each repo for more details on direct contributions. 

#### Build your own library
If you are interested maintaining your own codecollection and be compensated for your contirbutions, learn more about the [RunWhen Author Program](https://docs.runwhen.com/public/runwhen-authors/getting-started-with-codecollection-development)

#### Share new commands or improve existing ones
If you want to get involved in the community: 
- [Contribute and awesome troubleshooting command](https://github.com/runwhen-contrib/runwhen-local/issues/new?assignees=stewartshea&labels=runwhen-local%2Cawesome-command-contribution&projects=&template=awesome-command-contribution.yaml&title=%5Bawesome-command-contribution%5D+)
- [Need a new command? Ask the community for help](https://github.com/runwhen-contrib/runwhen-local/issues/new?assignees=stewartshea&labels=runwhen-local%2Cnew-command-request&projects=&template=commands-wanted.yaml&title=%5Bnew-command-request%5D+)
- [Get involved in GitHub Discussions](https://github.com/orgs/runwhen-contrib/discussions)

### Making RunWhen Local Better
If you have ideas on how the tool could be improved, please feel free to: 
- [Report bugs or share feedback](https://github.com/runwhen-contrib/runwhen-local/issues/new?assignees=stewartshea&labels=runwhen-local&projects=&template=runwhen-local-feedback.md&title=%5Brunwhen-local-feedback%5D+)




## Connect with us
Want to connect with the RunWhen community, [join us on slack](https://runwhen.slack.com/join/shared_invite/zt-1l7t3tdzl-IzB8gXDsWtHkT8C5nufm2A) or on [Discord](https://discord.com/invite/Ut7Ws4rm8Q)

## Documentation
Documentation will be stored in the [docs](docs/) folder. Available documentation currently contains: 
- [Architecture](docs/ARCHITECTURE.md)

## Roadmap
The following few items are currently being worked on or are in the backlog. Issues will be linked shortly. 

### Big Items
The following items are considered larger tasks on the roadmap:
- Restructuring of where rules and templates are stored (out of this image and alongside the troubleshooting code)
- Additional indexers for cloud resources (such as GCP, AWS, Azure)
- Removal of Neo4J to reduce image size

### Smaller Items
The following smaller items are also on the go: 
- High-level documentation
- Roadmap clarity: providing a roadmap in GitHub projects
- CI/CD: Deployment validation in a sandbox for PRs
- More troubleshooting commands. Always more :grin:
- Better contribution guides
- Low level documentation

In the meanwhile, we continue to add new features and troubleshooting code. Please raise issues to request features or contribute commands!

## Release Notes & Change Log
- Release notes can be found [here](https://github.com/runwhen-contrib/runwhen-local/releases).