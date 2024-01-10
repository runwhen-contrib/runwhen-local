# WorkspaceInfo Customization

RunWhen Local's primary configuration is provided in a file called `workspaceInfo.yaml`. This file is used to specify:&#x20;

* Which resources to discover and index (currently supporting Kubernetes, Microsoft Azure, and Google Cloud Platform)
* Which CodeCollection repositories to scan for applicable troubleshooting commands
* Additional workspace customizations to apply if uploading to a [RunWhen Platform workspace](https://docs.runwhen.com/public/runwhen-platform/feature-overview/workspaces)

### CodeCollection Discovery Customizations

The workspace builder component of RunWhen Local scans public git repositories to match troubleshooting commands with the resources it discovers in your cluster or cloud provider.&#x20;

Each individual git repository is considered a `codeCollection`, which contains one or more `codeBundle(s)`. Each `codeBundle` folder contains :&#x20;

* SLI or Troubleshooting Task code
* Generation Rules
* Templates&#x20;

#### Default CodeCollection Discovery

By default, RunWhen Local scans the `main` branch of the following `codeCollections`:&#x20;

* [https://github.com/runwhen-contrib/rw-cli-codecollection](https://github.com/runwhen-contrib/rw-cli-codecollection)
* [https://github.com/runwhen-contrib/rw-public-codecollection](https://github.com/runwhen-contrib/rw-public-codecollection)

#### Changing the CodeCollection Discovery Configuration

The `workspaceInfo.yaml` file supports the modification of which git repositories are used when generating the RunWhen Local content.&#x20;



In the following example, we omit all content from the default `codeCollection` repositories, and use a fork of the repository instead:&#x20;

```
codeCollections:
  - repoURL: "https://github.com/stewartshea/rw-cli-codecollection.git"
    ref: main
    codeBundles: ["*"]
  - repoURL: "https://github.com/stewartshea/rw-public-codecollection.git"
    ref: main
    codeBundles: ["*"]
```
