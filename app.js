// Load third party dependencies
const express = require('express'); // Correctly instantiate Express
const http = require('http');
const socketIo = require('socket.io');
const app = express(); // Instantiate Express app
const server = http.createServer(app);
const io = socketIo(server);
const path = require('path'); // For handling file paths

const SERVICE_ACCOUNT = {
  "type": "service_account",
  "project_id": "smit-genai-njsx",
  "private_key_id": "d0a8abb3d4934f16ef06fd404d0528665114dd6e",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDDP6ZEwrvckbSm\nahWvZ/yRpffejVgrCEy5ji3MXYb9f6SZhMKvr+CiBAenVCGR5GNcmejodz5E+1JN\nKFmsC6f+63vFjfzVnXZxnK79/1anB+pZ8luS73wFLjVjFMIlMKeCdb1BiGXl9mLD\nNlkU8TwQAo7HEdi5j7ZAfkCMjsZgUBh5gKiPCS2Ekro+HUY3sIjYlB9uthnKNAas\nUVgqmU0D6rUxoNLVW2EGEMu61cVmHT0gRIuwWuZt0/w2oijWK0AEGyCXePtGOkrf\n7x2dmIervlVmAI98c0sgxtjOOlgbgj2DnSBMXrGGBYZePtq2ODwu49kyaj72L/93\nt4MjzE6XAgMBAAECggEAAl4zwIgSFN8+2c6AkSje3c9YUxPTcBYrhAvu5Jh1H37x\npUZVwXa4b+Ps9IER39NCxz07ShJ5fVxaR62dGiKRY4dB8DKZez0WfNNB0Lp3jRK3\nVhGZPbjM1W1ANYGWHIhbXRAw1D94vjy/lDmFBBAsQnoddtmcZMe9lfOnXxezh+Mm\nApBMmCACJ1e2bgypGECsnxn5RtBxUyycwooYIIfhqv8XhhcVFG6wklihDjSGWZgL\nsR6kV1X+bOal/2gwLyA5K87c5kQ9sPx4QXkWIOzOwNdXr9iv3WLfRySCg2f689aJ\ntJIJwpvz1hUpi0c2Jr9vbjmOFm05/OPwKxx6q4UpOQKBgQD3vTuUE9AcsCvZLlnz\nNbxgXTItG8aFzfpy8MzqEdhVytcuDYdUsHRfNa4QOryGR+fjBb680Ce2tNVWRHio\nO2YhtJVqYX0n8cMSBkNBHeOUV0bSAgveGMDNHZj//PFQXjBhYl0Kcjyp/hq37WZ6\nA4I2ky0YZLenKCciUw3JnIwbrwKBgQDJwlfsrNgHpQukiJFNPPgCjHnR3LcrU0Kr\nkjsMrk20UsJNsszxqKdXXk39a0xwhODSPWofMC7BEX1CIw70gYQ7IG8ZbGx1sUe+\no6qYDZqJQ5SZSONXBbwMUDl/vFolYDAihe3m8SWXAZw7UrO8qkFfGE9Rh925vyKq\nPRfyUm4tmQKBgFeSHoNDVacuZvGIPueHsSTnDJuBW/VkUAldMTH0SOJapyFySsoW\n7avSD8tQ198nf8Jx/3BCrCcbWOX7oiLljD6R1Ncbyt/Zx7iRWiikZhPDnhcR/hvt\n6AkZU0H5qVtdUAC8gmL06pi0Z8FoO3cZ0md0MtaSk5CU0vCBJziDC8ulAoGBALqA\neNBiEiw25+VHDLHOSx/oBO/2zCczhuycdxNIyLGI0u4J+yLkGRRNK2C33+gfHMeb\nV87OtlloNlZ9m+RvGPGjEK/6puPAZaaXGioGYTTDkMiFNQmLVoI3Yn9ueBIWsUgo\nb3rMrUfCiE3aLCWZaGZkTWX7Zv297mhZoxowEoL5AoGAe5M/v001pv33V5AYuu5S\nWUN+cradTEWefayyYMM5D+BGMguaGeIF6OComns06GPvS5XfeBjSiEGAE5qZFDXj\nrxq1UjtyTXX8IPNmkPL8ueedRjKuOdXrl+Bj0s7FWPc/5btwsMTLN6hrgIEyJOqD\n1hB/DKJwVZX6kkzB/4Ehb8E=\n-----END PRIVATE KEY-----\n",
  "client_email": "handoff@smit-genai-njsx.iam.gserviceaccount.com",
  "client_id": "100742178631363462475",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/handoff%40smit-genai-njsx.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// Load our custom classes
const CustomerStore = require('./customerStore.js');
const MessageRouter = require('./messageRouter.js');

// Grab the service account credentials path from an environment variable
const keyPath = path.join(__dirname, 'credentials.json');
console.log(keyPath)
if (!keyPath) {
  console.log('You need to specify a path to a service account keypair in environment variable DF_SERVICE_ACCOUNT_PATH. See README.md for details.');
  process.exit(1);
}

// Load and instantiate the Dialogflow client library
const { SessionsClient } = require('dialogflow');
const dialogflowClient = new SessionsClient({
  keyFilename: keyPath
});

// Grab the Dialogflow project ID from an environment variable
const projectId = process.env.DF_PROJECT_ID || "smit-genai-njsx";
if (!projectId) {
  console.log('You need to specify a project ID in the environment variable DF_PROJECT_ID. See README.md for details.');
  process.exit(1);
}

// Instantiate our app
const customerStore = new CustomerStore();
const messageRouter = new MessageRouter({
  customerStore: customerStore,
  dialogflowClient: dialogflowClient,
  projectId: projectId,
  customerRoom: io.of('/customer'),
  operatorRoom: io.of('/operator')
});

// Serve static html files for the customer and operator clients
app.get('/customer', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'customer.html'));
});

app.get('/operator', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'operator.html'));
});

// Begin responding to websocket and http requests
messageRouter.handleConnections();
server.listen(3000, () => {
  console.log('Listening on:3000');
});
