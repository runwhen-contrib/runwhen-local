# RunWhen Platform Upload

## Setting Up a Workspace
- [Login to RunWhen Platform Beta Instance](https://app.beta.runwhen.com/)
- [Create a workspace](https://app.beta.runwhen.com/?addWorkspace=true)
- Put that cool workspace name that you created in this box: <input type="text" id="workspaceName">
- Click <a href="javascript:void(0)" onclick="updateLink()">This Button</button>
- <a href="#" id="dynamicLink">Download workspace tethering configuration file</a>


<script>
function updateLink() {
    let workspaceName = document.getElementById('workspaceName').value;
    if (workspaceName) {
        let link = document.getElementById('dynamicLink');
        link.href = "https://app.test.runwhen.com/workspace/" +workspaceName + "/configuration/workspace#" 
    }
}
</script>