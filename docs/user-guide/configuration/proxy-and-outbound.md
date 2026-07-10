# Proxy Configuration & Outbound Connections

As of v0.5.3 users can now support RunWhen Local running behind an HTTP proxy. Add the proxy environment variables to the container arguments that is applicable to your environment, for example:&#x20;

{% tabs %}
{% tab title="Kubernetes Deployment" %}
```
        env: 
        - name: HTTP_PROXY
          value: "http://proxy_host:proxy_port"
        - name: HTTPS_PROXY
          value: "http://proxy_host:proxy_port"
        - name: NO_PROXY
          value: "localhost"
```
{% endtab %}

{% tab title="Docker Command" %}
```
docker run --name RunWhenLocal --network host -p 8000:8000 -e NO_PROXY="localhost" -e HTTP_PROXY="http://proxy_host:proxy_port" -e HTTPS_PROXY="http://proxy_host:proxy_port" -v $workdir/shared:/shared -d runwhen-local:test

```
{% endtab %}
{% endtabs %}

Ensure that the container image is permitted to connect to the following URLS on port 443:&#x20;

* `.github.com`
* `.githubusercontent.com`
* `.cloudquery.io`
* Cloud Specific Endpoints&#x20;
  * `.googleapis.com`
  * `.microsoftonline.com`

{% hint style="info" %}
As new CloudQuery indexers are added, additional URLS may need to be added to this list (as it is not an exhaustive list).&#x20;
{% endhint %}

### Disabling CloudQuery Indexing

By default, RunWhen Local performs Kubernetes plus cloud resource discovery. Cloud discovery now uses the native SDK indexers (`azureapi` / `gcpapi` / `awsapi`) by default, and the CloudQuery component still runs but is a no-op unless a cloud's `*IndexerBackend` is explicitly set to `cloudquery`. If your RunWhen Local instance is intended to perform discovery for on-premise Kubernetes clusters **only**, then the CloudQuery discovery component can be disabled entirely. The following example will override the default entrypoint to disable cloudquery:&#x20;

```
        
      containers:
      - name: runwhen-local
        image: ghcr.io/runwhen-contrib/runwhen-local:latest
        command: ["/bin/bash"]
        args: ["-c", "/path/to/your/run.sh --disable-cloudquery"]
```

