# My Terminal Page - TEST

<div id="terminal2"></div>

<script src="https://cdn.jsdelivr.net/npm/xterm/lib/xterm.js"></script>
<script src="https://cdn.jsdelivr.net/npm/xterm-addon-attach/lib/xterm-addon-attach.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm/css/xterm.css" />

<script>
document.addEventListener("DOMContentLoaded", function() {
    var terminal = new Terminal();
    terminal.open(document.getElementById('terminal2'));
    
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/xterm`;
    const socket = new WebSocket(wsUrl);

    
    // Use the attach add-on to link xterm.js with the WebSocket
    const attachAddon = new AttachAddon.AttachAddon(socket);
    terminal.loadAddon(attachAddon);
    
    terminal.focus();
    // Handle input and display it in the terminal
    terminal.onData(data => {
        terminal.write(data);
    });

    // Handle the 'Enter' key
    terminal.onKey(({ key, domEvent }) => {
        if (domEvent.keyCode === 13) {
            terminal.write('\n');
        }
    });
});
</script>

<style>
#terminal {
    width: 100%;
    height: 500px;  /* Increased height for better visibility */
    border: 1px solid #000;
}
</style>
