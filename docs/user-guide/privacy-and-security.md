# Privacy & Security

Your Kubernetes based clusters and cloud resources are **sensitive information,** and **private to you.**

When determining if RunWhen Local presents a privacy risk, consider the following:

* You provide the kubeconfig needed for discovery -> this can be as permissive or as restrictive as you desire
* The kubeconfig is only shared with the local container, **running on your system**
* The kubeconfig is **never** **shared outside of the container or copied anywhere else**
* All generated configuration data resides with the locally running container
* No configuration data is sent outside of the locally running container

{% hint style="info" %}
It's worth noting that configuration data, once it's been reviewed, is able to be leveraged in the RunWhen Platform. This requires the user to specify the `--upload` option, and **never** sends any secret information -> this must be done manually in the platform. To read more about how the RunWhen Platform manages secrets, see [**Secrets**](https://docs.runwhen.com/public/runwhen-platform/secrets)
{% endhint %}
