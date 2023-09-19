# My Terminal Page

<div id="terminal"></div>

<script src="https://cdn.jsdelivr.net/npm/xterm/lib/xterm.js"></script>
<script src="https://cdn.jsdelivr.net/npm/xterm-addon-attach/lib/xterm-addon-attach.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm/css/xterm.css" />

<script>
// document.addEventListener("DOMContentLoaded", function() {
//     var terminal = new Terminal();
//     terminal.open(document.getElementById('terminal'));
//     terminal.write('Hello from xterm.js! Type something and press enter...\n');
    
//     // Focus the terminal so it can accept input
//     terminal.focus();
    
//     // Handle input and display it in the terminal
//     terminal.onData(data => {
//         terminal.write(data);
//     });

//     // Handle the 'Enter' key
//     terminal.onKey(({ key, domEvent }) => {
//         if (domEvent.keyCode === 13) {
//             terminal.write('\n');
//         }
//     });
// });
document.addEventListener("DOMContentLoaded", function() {
    var terminal = new Terminal();
    terminal.open(document.getElementById('terminal'));
    
    // Create a WebSocket connection to the backend
    const socket = new WebSocket('ws://0.0.0.0:3000');
    
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
    height: 400px;
    border: 1px solid #000;
}
</style>

