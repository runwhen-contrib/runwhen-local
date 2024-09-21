# CodeCollection Configuration

### CodeCollection Discovery

The workspace builder component of RunWhen Local scans public git repositories to match troubleshooting commands with the resources it discovers in your cluster or cloud provider.&#x20;

Each individual git repository is considered a `codeCollection`, which contains one or more `codeBundle(s)`. Each `codeBundle` folder contains :&#x20;

* SLI or Troubleshooting Task code
* Generation Rules
* Templates&#x20;

#### Default CodeCollection Discovery

By default, the workspace builder scans for code bundles from a built-in/preconfigured list of standard RunWhen CodeCollections. Currently, this list is:

<table><thead><tr><th width="633">Code Collection</th><th>Branch</th></tr></thead><tbody><tr><td><a href="https://github.com/runwhen-contrib/rw-public-codecollection.git">https://github.com/runwhen-contrib/rw-public-codecollection.git</a></td><td>main</td></tr><tr><td><a href="https://github.com/runwhen-contrib/rw-cli-codecollection.git">https://github.com/runwhen-contrib/rw-cli-codecollection.git</a></td><td>main</td></tr></tbody></table>

####

#### Changing the CodeCollection Discovery Configuration

You may want to override the default for a number of reasons:

* supplementing the built-in code collections with other third-party code collections
* suppressing one or more of the built-in code collections
* overriding the branch used for one or more code collections
* specifying a subset of the code bundles to enable for a code collection

To support these use cases the code collection list can be customized with a "codeCollections" block. This is a list of the code collections to enable. A code collection item in the list can be specified with either a simple string or a code collection object/block with info about the target code collection.

For the string specification the string is just the URL of the git repo. The string can also be the special "defaults" value, which enables all the built-in code collections. This is useful if you want to enable most of the built-in code collections, but suppress/blacklist some of them. If you prefix the git URL with a "!" character, then that means to exclude that code collection rather than enable it. When using the string format for a code collection entry the "main" branch is used. If you want to specify a different branch you need to use the object/block format.

The object block format for a code collection entry is an object/dictionary with the following fields:

| Field Name  | Description                                                           |
| ----------- | --------------------------------------------------------------------- |
| repoURL     | URL of the git repo for the code collection                           |
| branch      | branch to use in the repo                                             |
| tag         | tag to use in the repo                                                |
| ref         | git ref to use in the repo                                            |
| authUser    | user id to use when cloning the repo                                  |
| authToken   | auth token credential to use when cloning repo                        |
| action      | inclusion action, either "include" or "exclude", defaults to "include |
| codeBundles | List of code bundles to enable for the code collection                |

Only one of the branch, tag or ref fields should be specified.

The authUser and authToken fields are only necessary for non-public repos. All the RunWhen-provided code collections are open source, so they don't require any credentials.

The "action" field lets you toggle between inclusion/whitelist and exclusion/blacklist. The most common use case will just be an explicit whitelist of included code collections. Since the "action" field defaults to "include" you can just omit it for that use case.

The "codeBundles" field is just a list of the names of the code bundles to enable. The code bundle name is the directory name of the code bundle in the codebundles directory in the code collection. This field is optional. If it's omitted, then all code bundles are enabled. The code bundle value can be a file glob expression like you can use is the command line shell, so you can have wildcard expressions that match multiple code bundles. TODO: would be nice to have some examples here.

The custom code collection configuration is useful for code collection authors. For new third-party code collections you can just add the new code collection to the list. If you're developing/testing a single code bundle, you can limit the workspace builder to just that code bundle:

```yaml
codeCollections:
- repoURL: https://github.com/author-account/my-custom-code-collection.git
  codeBundles:
  - my-code-bundle
```

If you're developing new code bundles for one of the standard RunWhen code collections, then the easiest way to handle that is to fork the RunWhen repo and then stage your new code bundle code in the fork. Remember that you need to commit any changes you make to your local clone and push to the GitHub repo to make the new code accessible to the workspace builder.

#### Custom Code Bundle Configuration Variables

Individual code bundles may require additional information to generate the SLX files in the generated workspace. These settings go in the "custom" block in the workspace info file. Consult the documentation for the code collection for information about which custom settings are required for specific code bundles.

