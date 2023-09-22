const express = require('express');
const { spawn } = require('node-pty');
const WebSocket = require('ws');

const app = express();
const port = 3000;

// Serve static files (like your MkDocs page with xterm.js)
app.use(express.static('public'));

const server = app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});

// Setup WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');

    let isAlive = true;
    ws.on('pong', () => {
        isAlive = true;
    });

    const interval = setInterval(() => {
        if (isAlive === false) return ws.terminate();

        isAlive = false;
        ws.ping(() => {});
    }, 30000);  // 30 seconds

    ws.on('close', () => {
        clearInterval(interval);
    });

    // Spawn a new shell process for each WebSocket connection
    const shell = spawn('bash');

    // When data is received from the shell, send it to the WebSocket
    shell.on('data', (data) => {
        ws.send(data);
    });

    // When data is received from the WebSocket, send it to the shell
    ws.on('message', (msg) => {
        shell.write(msg);
    });
});