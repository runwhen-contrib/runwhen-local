const express = require('express');
const { spawn } = require('node-pty');
const WebSocket = require('ws');
const multer = require('multer');
const { exec } = require('child_process');

const app = express();
const port = 3000;

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/shared');
    },
    filename: (req, file, cb) => {
        cb(null, 'uploadInfo.yaml');
    }
});
const upload = multer({ storage: storage });

// Serve static files
app.use(express.static('public'));

// Route to handle file uploads
app.post('/store-uploadinfo', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send('File uploaded successfully.');
});

const server = app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});

app.get('/run-discovery', (req, res) => {
    // run discovery without upload
    exec('./run.sh', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send(`Error executing command: ${error}`);
        }
        res.send(`Discovery Output:\n${stdout}`);
    });
});

app.get('/run-upload-to-runwhenplatform', (req, res) => {
    // run discovery with upload
    exec('python3 run.py upload --upload-merge-mode keep-uploaded', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send(`Error executing command: ${error}`);
        }
        res.send(`Upload Output:\n${stdout}`);
    });
});


// Setup xterm WebSocket server
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
