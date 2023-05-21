const { app, BrowserWindow } = require('electron');
const express = require('express');
const { Client } = require('minecraft-launcher-core');
const { Auth } = require('msmc');

const port = 3000;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadURL('http://localhost:' + port);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', () => {
  const server = express();

  server.use(express.static('public'));

  server.get('/launch', async (req, res) => {
    try {
      const selectedVersion = req.query.version;
      const selectedMaxMemory = req.query.maxMemory;
      const selectedMinMemory = req.query.minMemory;

      console.log('Starting Minecraft (' + selectedVersion + ')...');

      const launcher = new Client();

      const authManager = new Auth('select_account');
      const xboxManager = await authManager.launch('raw');
      const token = await xboxManager.getMinecraft();

      let opts = {
        clientPackage: null,
        authorization: token.mclc(),
        root: './.minecraft',
        version: {
          number: selectedVersion,
          type: 'release'
        },
        memory: {
          max: selectedMaxMemory,
          min: selectedMinMemory
        }
      };

      console.log('Starting Minecraft launcher...');
      launcher.launch(opts);

      launcher.on('debug', (e) => console.log(e));
      launcher.on('data', (e) => console.log(e));

      res.send('Minecraft launched successfully!');
    } catch (error) {
      console.error('Error launching Minecraft: ' + error);
      res.status(500).send('Error launching Minecraft');
    }
  });

  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
