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
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    res.json({ success: true, message: 'File uploaded successfully.' });
});

const server = app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});

// app.get('/run-discovery', (req, res) => {
//     if (fs.existsSync(lockFilePath)) {
//         console.log('Lock file exists.');
//         res.status(409).send(`Existing discovery in progress. Please wait until this process has finished.`);
//     } else {
//         console.log('Creating lock file...');
//         fs.writeFileSync(lockFilePath, 'locked');

//         exec('WB_DEBUG_SUPPRESS_CHEAT_SHEET="false" ./run.sh', (error, stdout, stderr) => {
//             if (error) {
//                 console.error(`exec error: ${error}`);
//                 fs.unlinkSync(lockFilePath); // Remove the lock file on error.
//                 return res.status(500).send(`Error executing command: ${error}\nStderr: ${stderr}`);
//             }

//             // Remove the lock file after successful execution.
//             fs.unlinkSync(lockFilePath);
//             console.log('Lock file removed.');
//             res.send(`Discovery Output:\n${stdout}`);
//         });
//     }
// });
app.get('/run-discovery', (req, res) => {
    // Execute the shell script with proper environment variables
    const childProcess = exec('WB_DEBUG_SUPPRESS_CHEAT_SHEET="false" ./run.sh', (error, stdout, stderr) => {
        if (error) {
            // If there is an error, send a 500 Internal Server Error response
            res.status(500).send(`Errors:\n${stderr}`);
        } else {
            // If there is no error, send a 200 OK response with stdout
            res.status(200).send(`Status:\n${stdout}\n\nErrors:\n${stderr}`);
        }
    });

    // Capture and send the output and errors as they come in
    childProcess.stdout.pipe(process.stdout);
    childProcess.stderr.pipe(process.stderr);
});


app.get('/run-upload-to-runwhenplatform-keep-existing', (req, res) => {
    // run discovery with upload
    exec('WB_DEBUG_SUPPRESS_CHEAT_SHEET="true" ./run.sh --upload --upload-merge-mode keep-existing', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send(`Error executing command: ${error}\nStderr: ${stderr}`);
        }
        res.send(`Upload Output:\n${stdout}`);
    });
});

app.get('/run-upload-to-runwhenplatform-keep-uploaded', (req, res) => {
    // run discovery with upload
    exec('WB_DEBUG_SUPPRESS_CHEAT_SHEET="true" ./run.sh --upload --upload-merge-mode keep-uploaded ', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send(`Error executing command: ${error}\nStderr: ${stderr}`);
        }
        res.send(`Upload Output:\n${stdout}`);
    });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/run-generate-clusterview-sa', (req, res) => {
    const contexts = req.body.contexts;
    const namespace = req.body.namespace;
    const serviceAccount = req.body.serviceAccount;

    if (!contexts || contexts.length === 0) {
        return res.status(400).send('No contexts provided');
    }

    // Convert the list of contexts into a space-separated string
    const contextString = contexts.join(',');

    // Insert the values in the command
    exec(`./scripts/gen_clusterview_sa.sh ${contextString} ${namespace} ${serviceAccount}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send(`Error executing command: ${error}\nStderr: ${stderr}`);
        }
        res.send(`Script Output:\n${stdout}`);
    });
});

app.post('/run-generate-kubeconfig-from-in-cluster-auth', (req, res) => {
    const serverDetails = req.body.serverDetails;

    if (!serverDetails || serverDetails.length === 0) {
        return res.status(400).send('No server details provided');
    }

    // Insert the values in the command
    exec(`./scripts/in_cluster_auth_gen_kubeconfig.sh ${serverDetails}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send(`Error executing command: ${error}\nStderr: ${stderr}`);
        }
        res.send(`Script Output:\n${stdout}\n${stderr}`);
    });
});


app.post('/get-runbook-config', (req, res) => {
    const runbook = req.body.runbook;
    if (!runbook || runbook.length === 0) {
        return res.status(400).send('No runbook provided');
    }
    exec(`cat /shared/output${runbook}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send(`Error executing command: ${error}`);
        }
        res.send(`${stdout}`);
    });
});

app.post('/status', (req, res) => {
    exec(`cat /shared/output/.status`, (error, stdout, stderr) => {
        let responseText = stdout || '';

        if (stderr) {
            responseText += '\n' + stderr;
        }

        res.send(responseText);
    });
});


// Setup xterm WebSocket server
const isTerminalDisabledEnv = process.env.RW_LOCAL_TERMINAL_DISABLED;
const isTerminalDisabled = isTerminalDisabledEnv ? isTerminalDisabledEnv.toLowerCase() === 'true' : false;
console.log('Environment Variable:', isTerminalDisabledEnv);
console.log('Normalized Value:', isTerminalDisabled);

if (isTerminalDisabled) {
    // Handle routes when the terminal is disabled
    app.get('/xterm', (req, res) => {
      res.status(404).send('Terminal is disabled');
    });
  } else {
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
}
