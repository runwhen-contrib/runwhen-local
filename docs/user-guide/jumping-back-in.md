---
description: >-
  If you've previously deployed RunWhen Local, but can't remember where or how
  it was deployed, the following steps may help:
---

# Jumping Back In

### Opening RunWhen Local from the Command Line

If you added a command line alias, you might be able to open your cheat sheet from your terminal, for example:&#x20;

```
$ runwhen-local
```

See [this link](https://docs.runwhen.com/public/v/runwhen-local/user-guide/getting-started/getting\_started-running\_locally#optional-add-a-cli-shortcut) for the instructions if deployed locally, and [this link](https://docs.runwhen.com/public/v/runwhen-local/user-guide/getting-started/getting\_started-running\_in\_kubernetes#optional-add-a-cli-shortcut) for the instructions if deployed in Kubernetes.&#x20;

### Checking if it was [Getting\_Started-Running\_Locally.md](../Getting\_Started-Running\_Locally.md "mention")

To check if RunWhen Local was deployed on your local machine with Docker / Podman:&#x20;

* Check for any container images

```
$ docker images
REPOSITORY                                                             TAG       IMAGE ID       CREATED        SIZE
ghcr.io/runwhen-contrib/runwhen-local                                  0.4.1     4e1476eb74b0   3 weeks ago    2.16GB
```

* Restart the container image;&#x20;

```
$ docker start RunWhenLocal
```

* Or [clean up](https://docs.runwhen.com/public/v/runwhen-local/user-guide/getting-started/getting\_started-running\_locally#cleanup) and [generate your cheat sheet ](https://docs.runwhen.com/public/v/runwhen-local/user-guide/getting-started/getting\_started-running\_locally#generating-your-cheat-sheet)again
* Navigate to https://localhost:8081



### Checking if it was [Getting\_Started-Running\_in\_Kubernetes.md](../Getting\_Started-Running\_in\_Kubernetes.md "mention")

If RunWhen Local was deployed into a Kubernetes cluster, chances are that there is a namespace called `runwhen-local` in one of your clusters. Run the following command to see which contexts may contain a namespace with this name:&#x20;

```
RUNWHEN_LOCAL_NAMESPACE_NAME=runwhen-local; for context in $(kubectl config get-contexts -o name); do kubectl --context="$context" get namespace $RUNWHEN_LOCAL_NAMESPACE_NAME --ignore-not-found && echo "Namespace '$RUNWHEN_LOCAL_NAMESPACE_NAME' found in context: $context"; done
```



Once the correct context is identified, switch to that context and either list the ingress object in that namespace to determine the URL, or[ port forward the service to your local machine](https://docs.runwhen.com/public/v/runwhen-local/user-guide/getting-started/getting\_started-running\_in\_kubernetes#testing-the-runwhen-local-deployment) to view the cheat sheet and access it at [http://localhost:8081](http://localhost:8081).
