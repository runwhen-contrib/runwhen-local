# Built-In Terminal

RunWhen Local provides copy & paste commands that you can run from your own system. In some cases, it might be faster to run it directly from the UI. For those cases, a built-in terminal has been included in the web interface.&#x20;

* For Docker deployments, the built in terminal is **enabled** by default
* For Kubernetes deployments, the built in terminal is **disabled** by default

The built-in terminal has access to CLI tools like kubectl, oc, jq, and so on. And since it has access to the same Kubeconfig used to discover your resources, you can directly run the cheat-sheet commands from the terminal.&#x20;

{% hint style="danger" %}
The built-in terminal allows anyone with access to the web interface to have have `docker exec` or `kubectl exec` access to this container, which has access to the `shared` directory and its contents. Please consider this when choosing to enable or disable the terminal feature.&#x20;
{% endhint %}



<figure><img src="../../.gitbook/assets/terminal (2).gif" alt=""><figcaption><p>Built in terminal</p></figcaption></figure>

### Enabling & Disabling the Terminal

The terminal can be enabled or disabled with an environment variable:&#x20;

* **Enable the terminal**: `RW_LOCAL_TERMINAL_DISABLED=false`
* **Disable the terminal**: `RW_LOCAL_TERMINAL_DISABLED=true`
