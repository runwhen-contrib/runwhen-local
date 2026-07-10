# Kubernetes Configuration

**Kubernetes**

The supported fields for Kubernetes (block name = "kubernetes) are:

<table><thead><tr><th width="515">Field Name</th><th>Description</th></tr></thead><tbody><tr><td>kubeconfigFile</td><td>The name of the kubeconfig file to use</td></tr><tr><td>namespaceLODs</td><td>Object/dictionary specifying level of detail values for specific namespaces</td></tr><tr><td>namespaces</td><td>An explicit list of which namespaces to scan for resources</td></tr><tr><td>excludeAnnotations</td><td>User specified annotations that will skip the discovery of a resource if found</td></tr><tr><td>excludeLabels</td><td>User specified labels that will skip the discovery of a resource if found</td></tr></tbody></table>

For the "kubeconfig" field you need to copy that file into the shared directory and the field value is just the name of that file.

The "namespaceLODs" field is a dictionary/object where the key/field is the name of the namespace and the value is a level of detail value, either "none", "basic" or "detailed" as described above.

The "namespaces" field should only be needed in cases of limited privilege where the credentials in the kubeconfig file don't have privileges to list all the available namespaces, but do have privileges to access resources in certain namespaces, but you need to already know the names of the namespaces. So this is a mechanism for specifying this explicit list of namespaces.



### Discovery Exclusions

In order to exclude resources from discovery, the following Kubernetes labels or annotations can be applied to the object:&#x20;

* Annotation: `config.runwhen.com/ignore: "true"`
* Label: `runwhen-local: "ignore"`

Additionally, users may add custom annotations or labels into the workspaceInfo configuration file using the `excludeAnnotations` or `excludeLabels` options, such as:&#x20;

```
cloudConfig:
  kubernetes:
    excludeAnnotations:
      config.runwhen.com/discovery: "exclude"
    excludeLabels:
      runwhen: "exclude"
```

### Level of Detail Annotations

The following annotations can be applied to Kubernetes resources, such as namespaces, to specify the Level of Detail applied during discovery. This setting will override the Level of Detail configuration in the workspaceInfo file.

```
config.runwhen.com/lod: [none, basic, detailed]
```



### Resource Owner Annotations

The owner of a resource can also be annotated on a Kubernetes object, allowing for easier synamic assignment of SLX owners:&#x20;

```
config.runwhen.com/owner: "owner@here.com"
```



Ex
