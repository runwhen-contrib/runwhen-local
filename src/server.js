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

    const shell = spawn('bash', [], {
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
    });

    // When data is received from the shell, send it to the WebSocket
    shell.on('data', (data) => {
        ws.send(data);
    });

    ws.on('message', (data) => {
        const msg = data.toString(); // Convert the binary data to a string
        console.log(`Backend terminal dimensions: ${shell.cols}x${shell.rows}`);
        if (msg.startsWith("resize:")) {
            const parts = msg.split(":")[1].split(",");
            const cols = parseInt(parts[0], 10);
            const rows = parseInt(parts[1], 10);
    
            if (!isNaN(cols) && !isNaN(rows)) {
                shell.resize(cols, rows);
            } else {
                console.error("Invalid resize parameters:", msg);
            }
        } else {
            shell.write(msg);
        }
    });
});
