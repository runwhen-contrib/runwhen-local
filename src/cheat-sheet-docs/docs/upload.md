# RunWhen Platform Upload


> Note: this process currently only works for a single-node cluster

## Setting Up a Workspace
- [Login to RunWhen Platform Beta Instance](https://app.beta.runwhen.com/)
- [Create a workspace](https://app.beta.runwhen.com/?addWorkspace=true)
- Put that cool workspace name that you created in this box: <input type="text" id="workspaceName">
- Click <a href="javascript:void(0)" onclick="updateLink()">This Button</button>
- <a href="#" id="dynamicLink">Download workspace tethering configuration file</a>
- Open the terminal (top right corner)
- Run <placeholder command for secret generation>
- Copy the contents into 


## Execute the Upload
- 

<script>
function updateLink() {
    let workspaceName = document.getElementById('workspaceName').value;
    if (workspaceName) {
        let link = document.getElementById('dynamicLink');
        link.href = "https://app.beta.runwhen.com/workspace/" +workspaceName + "/configuration/workspace#" 
    }
}
</script>