# Introduction

<figure><img src="assets/introduction.png" alt=""><figcaption></figcaption></figure>

## What Is it?

We all have complex CLI commands saved in a file or wiki somewhere that are helpful, but constantly need to be adapted, or are difficult to find when we need them.

RunWhen Local is a container that provides a searchable web interface that provides helpful copy & paste CLI commands for troubleshooting apps deployed to **your** Kubernetes environment from an open source community of DevOps/Platform/SRE engineers. Oh yeah, and it's [FOSS](https://en.wikipedia.org/wiki/Free\_and\_open-source\_software).&#x20;

* You run the container
* It scans your clusters
* It finds the right troubleshooting commands that match your resources
* And delivers troubleshooting commands that you can copy and paste

## Who is it for?

Anyone that is working on, or in, Kubernetes environments might find RunWhen Local helpful.

* Kubernetes administrators
* Kubernetes application developers
* L1/L2/L3 Support teams that manage Kubernetes environments

## Where can I see it?

There are a few ways to see if this is interesting to you:

* Checkout out our _live demo instance_ here: [https://runwhen-local.sandbox.runwhen.com/](https://runwhen-local.sandbox.runwhen.com/)
  * Note: It's pointed at our sandbox cluster, and so the commands are tailored for that environment.
* Check out our [YouTube Channel](https://www.youtube.com/@whatdoirunwhen) with **short demo videos**
* Run it yourself :point\_down:

## How can I run my own version?

Jump right over to [running-locally.md](getting-started/running-locally.md "mention") or [running-in-kubernetes.md](getting-started/running-in-kubernetes.md "mention") to deploy your own instance of RunWhen Local.



### Want to Contribute? Have an awesome troubleshooting command to share?

If you want to get involved in the community:

* [Report bugs or share feedback](https://github.com/runwhen-contrib/runwhen-local/issues/new?assignees=stewartshea\&labels=runwhen-local\&projects=\&template=runwhen-local-feedback.md\&title=%5Brunwhen-local-feedback%5D+)
* [Contribute and awesome troubleshooting command](https://github.com/runwhen-contrib/runwhen-local/issues/new?assignees=stewartshea\&labels=runwhen-local%2Cawesome-command-contribution\&projects=\&template=awesome-command-contribution.yaml\&title=%5Bawesome-command-contribution%5D+)
* [Need a new command? Ask the community for help](https://github.com/runwhen-contrib/runwhen-local/issues/new?assignees=stewartshea\&labels=runwhen-local%2Cnew-command-request\&projects=\&template=commands-wanted.yaml\&title=%5Bnew-command-request%5D+)
* [Get involved in GitHub Discussion](https://github.com/orgs/runwhen-contrib/discussions)s



### Connect with Us

Want to connect with the RunWhen community, [join us on slack](https://runwhen.slack.com/join/shared\_invite/zt-1l7t3tdzl-IzB8gXDsWtHkT8C5nufm2A) or [Discord](https://discord.com/invite/Ut7Ws4rm8Q).



## What is the future of RunWhen Local?

RunWhen Local will be officially FOSS in the next few sprints (e.g. open source licened, better contributor guides, and the main code base added to the repo). It will continue to become more useful as the open source community of troubleshooting contributions grows and as we add more indexing capabilities (such as discovering more Kubernetes resources, or cloud resources from AWS, GCP, and Azure).