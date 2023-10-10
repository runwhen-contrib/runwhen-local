# Upload to RunWhen Platform

RunWhen Local generates workspace configuration files that can be uploaded to the RunWhen Platform, automatically constructing a fully configured map of your resources and associated troubleshooting tasks.&#x20;

### Uploading to the RunWhen Platform

RunWhen Local will look for the file called `uploadInfo.yaml` in the `/shared` directory of the container image. This file is obtained from the RunWhen Platform interface from **Configuration --> Workspace --> Automated Workspace Builder Config File**

<figure><img src="../../.gitbook/assets/image.png" alt=""><figcaption><p>Obtaining the uploadInfo.yaml file from RunWhen Platform</p></figcaption></figure>

With this file in place, re-run the discovery process with the `--upload` flag:&#x20;

```
docker exec -w /workspace-builder -- RunWhenLocal ./run.sh --upload
```

#### Additional Upload Options for Merge Conflicts

Additional upload options are available to handle certain cases where the same SLX already exists on the platform and RunWhen Local has generated new configuration under the same name:&#x20;

```
--upload-merge-mode keep-uploaded
    - Favor the current configuration and overwrite what is in RunWhen Platform
--upload-merge-mode keep-existing 
    (default) - Preserve any configuration already in place in RunWhen Platform
```

