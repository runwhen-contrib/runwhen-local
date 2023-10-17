---
search:
  exclude: true
---
# Discovery Status

<div id="status">
  <pre class="code-block" style="color: white;" id="fileContents"></pre>
</div>
<script>
    // Function to fetch and update terminal contents
    function updateTerminalContents() {
        fetch('/status', { method: 'POST' }) // Replace with your endpoint URL
            .then(response => response.text())
            .then(data => {
                // Split data into lines
                const lines = data.split('\n');

                // Separate stdout and stderr
                const stdout = lines.filter(line => !line.startsWith('stderr:')).join('\n');
                const stderr = lines.filter(line => line.startsWith('stderr:')).join('\n');

                // Display both stdout and stderr in the terminal
                const terminalElement = document.getElementById('fileContents');
                terminalElement.textContent = `Status:\n${stdout}\n\nErrors:\n${stderr}`;
            })
            .catch(error => {
                console.error('There was a problem fetching terminal contents:', error.message);
            });
    }

    // Update terminal contents initially
    updateTerminalContents();

    // Set up a periodic refresh every 5 seconds
    setInterval(updateTerminalContents, 5000);
    
</script>
<style>
#status {
    font-family: monospace; /* Monospace font for the "status" content */
    background-color: black; /* Background color for the "status" content */
    color: white !important; /* Text color for the "status" content (force it to white) */
    font-size: 12px;
    line-height: 1; /* Adjust line height to remove extra spacing */
    padding: 0px 10px; /* Reduced top padding, increased right and left padding */
    white-space: pre;
    max-height: 400px;
    overflow: auto;
    border: 1px solid white;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}
#status .code-block {
  color: white !important;
}
</style>