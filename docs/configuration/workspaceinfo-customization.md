# WorkspaceInfo Customization

RunWhen Local's primary configuration is provided in a file called `workspaceInfo.yaml`. This file is used to specify:&#x20;

* Which resources to discover and index (currently supporting Kubernetes, Microsoft Azure, AWS, and Google Cloud Platform)
* Which [CodeCollection](https://registry.runwhen.com) repositories to scan for applicable tasks, health checks, and other automation scripts
* Additional customizations to apply when uploading to a [RunWhen Platform workspace](https://docs.runwhen.com/public/runwhen-platform/feature-overview/workspaces)

The top-level structure of the workspace info file is:

```yaml
# Information about the RunWhen workspace
workspaceName: my-workspace
# More workspace config
# Information about cloud platforms to scan to discover resources
cloudConfig:
  kubernetes:
    # Kubernetes config
  azure:
    # Azure config
  # Other platform configs
  
# Information about which code collections to scan for code bundles
codeCollections:
- "https://github.com/runwhen-contrib/rw-public-codecollection.git"
- # Another code collections to scan


# Custom information about specific code bundles
custom:
  prometheus_provider: gmp
  # More custom configuration
```

#### Basic Workspace Configuration Info

There are several settings that are used to configure information in the workspace that's generated to be uploaded to the RunWhen platform to. The available settings are:

<table><thead><tr><th width="290">Label</th><th>Description</th></tr></thead><tbody><tr><td>workspaceName</td><td>The name of the workspace to generate</td></tr><tr><td>workspaceOwnerEmail</td><td>The email address of the owner of the workspace</td></tr><tr><td>defaultLocation</td><td>The location where the the workspace is hosted</td></tr><tr><td>defaultLOD</td><td>The default level of detail to user for cloud resources</td></tr></tbody></table>

####
