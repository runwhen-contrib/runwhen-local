# RunWhen Platform Upload


> Note: this process currently only works for a single-node cluster


## 1. Setting Up a Workspace

- <a href="https://app.beta.runwhen.com/" target="_blank">Login to RunWhen Platform Beta Instance</a>
- <a href="https://app.beta.runwhen.com/?addWorkspace=true" target="_blank">Create a workspace</a>
- Put that cool workspace name that you created in this box: <br>
<input type="text" id="workspaceName"><a href="javascript:void(0)" onclick="updateLink()"><br>Submit</a>

## 2. Preparing for Upload

- <a href="#" id="dynamicLink" target="_blank">Download workspace tethering configuration file</a>
- Add this file to the RunWhen Local container: 

!!! info "Adding uploadInfo.yaml to the container"
    === "Upload to Container"
        Upload the `uploadInfo.yaml` for one-time use. This file may be removed when the container restarts.

        <br><input type="file" id="fileInput"><a href="javascript:void(0)" onclick="uploadFile()"><br>Upload</a>

    === "Use the Built-In Terminal"
        If the in-browser terminal is available: 

        - copy the contents of `uploadInfo.yaml` into your clipboard
        - open the terminal (top right corner)
        - using `cat` or `vi`, paste the contents into `/shared/uploadInfo.yaml`
        <img src="../assets/uploadInfo.gif" />

    === "Use Your Terminal (Running Locally)"
        From your own terminal, simply move the `uploadInfo.yaml` file into `$workdir/shared/uploadInfo.yaml`:

        <div class="code-block-container">
        <pre class="code-block"><code>
        cp uploadInfo.yaml $workdir/shared/uploadInfo.yaml 
        </code></pre>
        </div>



    === "Update Helm (Running in Kubernetes)"
        If using Helm, add the `uploadInfo.yaml` details as part of your values.yaml specification. The following example demonstrates a Helm configuration for use with FluxCD: 
        
        <div class="code-block-container">
        <pre class="code-block"><code>
        apiVersion: helm.toolkit.fluxcd.io/v2beta1
        kind: HelmRelease
        metadata:
            name: runwhen-local
            namespace: runwhen-local
        spec:
          releaseName: runwhen-local
          chart:
            spec:
              chart: runwhen-local
              # https://github.com/runwhen-contrib/helm-charts/blob/main/charts/runwhen-local/values.yaml
              version: 0.0.21
              sourceRef:
                kind: HelmRepository
                name: runwhen-contrib
                namespace: flux-system
              interval: 5m
              values:
                image: 
                  repository: ghcr.io/runwhen-contrib/runwhen-local
                  tag: latest
                uploadInfo:
                  defaultLocation: location-01-us-west1
                  papiURL: https://papi.beta.runwhen.com
                  token: [token]
                  workspaceName: b-sandbox
                  workspaceOwnerEmail: workspace-user@tester.com
        </code></pre>
        </div>
        See the [full values.yaml](https://github.com/runwhen-contrib/helm-charts/blob/main/charts/runwhen-local/values.yaml) for reference. 
        > Note: When updating your Helm values, this can trigger a redeployment of the container and a new discovery will take place. 

??? tip "Permission Issues?"
    If you experience permission issues, ensure that `$workdir/shared` has open permissions. The `runwhen` user in the container read/write to this directory, and it is often shared with your own filesystem and owned by your local user.
    
        ```
        chmod 777 $workdir/shared
        ``` 

## 3. Execute the Upload

<div class="card-grid" markdown>
<div class="card">
    <img class="card-icon" src="https://storage.googleapis.com/runwhen-nonprod-shared-images/icons/search.svg" alt="Icon" />
    <h6 class="card-title">
    <a href="javascript:void(0)" id="runDiscoveryButton">Run Discovery</a>
</div>
<div class="card">
    <img class="card-icon" src="https://storage.googleapis.com/runwhen-nonprod-shared-images/icons/cloud_upload.svg" alt="Icon" />
    <h6 class="card-title">
    <a href="javascript:void(0)" id="runUploadButton">Upload to RunWhen Platform</a>
</div>
</div>

## 4. Creating your Kubeconfig Secret





<script>
function updateLink() {
    let workspaceName = document.getElementById('workspaceName').value;
    if (workspaceName) {
        let link = document.getElementById('dynamicLink');
        link.href = "https://app.beta.runwhen.com/workspace/" +workspaceName + "/configuration/workspace#" 
    }
}
function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a file first.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // Send the file to the server using Fetch API
    fetch('/store-uploadinfo', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
    })
    .catch(error => {
        alert('Error uploading the file.');
        console.error(error);
    });
}
document.getElementById('runDiscoveryButton').addEventListener('click', function() {
    event.preventDefault();
    // Call the /run-discovery endpoint using the fetch API
    fetch('/run-discovery')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            // Call the showCommandOutput function to display the data in the styled popup
            showCommandOutput(data);
        })
        .catch(error => {
            console.error('There was a problem with the discovery operation:', error.message);
        });
});
document.getElementById('runUploadButton').addEventListener('click', function() {
    event.preventDefault();
    // Call the /run-discovery endpoint using the fetch API
    fetch('/run-upload-to-runwhenplatform')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            // Call the showCommandOutput function to display the data in the styled popup
            showCommandOutput(data);
        })
        .catch(error => {
            console.error('There was a problem with the discovery operation:', error.message);
        });
});

function showCommandOutput(data) {
    const popupContainer = document.createElement("div"); 
    const popup = document.createElement("div");
    popup.classList.add("popup");

    const closeButton = document.createElement("span");
    closeButton.classList.add("close");
    closeButton.innerHTML = "&times;";
    closeButton.style.fontSize = "24px"; 
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";

    const title = document.createElement("p");
    title.innerText = "Command Output";

    const codeBlock = document.createElement("pre");
    codeBlock.classList.add("code-block");
    codeBlock.innerText = data;

    popup.appendChild(closeButton);
    popup.appendChild(title);
    popup.appendChild(codeBlock);
    popupContainer.appendChild(popup);
    document.body.appendChild(popupContainer);

    // Event delegation for close button click
    popupContainer.addEventListener("click", (event) => {
        const target = event.target;
        if (target.classList.contains("close")) {
            event.stopPropagation();
            document.body.removeChild(popupContainer);
        }
    });
}
</script>
