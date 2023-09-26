# Terminal Configuration

RunWhen Local provides a browser accessible terminal. This terminal connects directly to the RunWhen Local container, with the goal of providing faster access to running cheat sheet commands & scripts as the `runwhen` terminal user.&#x20;

<figure><img src="../../.gitbook/assets/terminal.gif" alt=""><figcaption><p>Terminal Example</p></figcaption></figure>

### Disabling the Terminal

The terminal is enabled by default; to disable the terminal, set the environment variable `RW_LOCAL_TERMINAL_DISABLED` to `True`



By example:&#x20;

{% tabs %}
{% tab title="Docker" %}
```
docker run --name RunWhenLocal -p 8081:8081 -e RW_LOCAL_TERMINAL_DISABLED=true -v $workdir/shared:/shared -d ghcr.io/runwhen-contrib/runwhen-local:latest
```
{% endtab %}

{% tab title="Kubernetes" %}
```
...
    spec:
      containers:
      - name: runwhen-local
        image: ghcr.io/runwhen-contrib/runwhen-local:latest
        imagePullPolicy: Always
        ports:
          - containerPort: 8081
          - containerPort: 8000
          - containerPort: 7687
        env: 
        - name: RW_LOCAL_TERMINAL_DISABLED
          value: "True"
...
```
{% endtab %}
{% endtabs %}
