const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs-extra');

// 判断是否为开发模式
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let nextServer;

// 获取用户数据目录（便携模式下使用应用同级目录）
const userDataPath = isDev
    ? path.join(__dirname, '..')
    : path.join(path.dirname(app.getPath('exe')), 'user_data');

// 确保用户数据目录存在
if (!isDev) {
    fs.ensureDirSync(userDataPath);
}

// 设置数据库路径
const dbPath = path.join(userDataPath, 'user_data.db');
process.env.DATABASE_URL = `file:${dbPath}`;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        icon: path.join(__dirname, '../build/icon.ico'),
        title: 'AIGC Media Hub',
        backgroundColor: '#1a1a1a',
        show: false,
    });

    // 窗口准备好后显示
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    if (isDev) {
        // 开发模式：连接到 Next.js 开发服务器
        const startUrl = 'http://localhost:3000';

        // 等待开发服务器启动
        const waitForServer = () => {
            const http = require('http');
            http.get(startUrl, () => {
                mainWindow.loadURL(startUrl);
                mainWindow.webContents.openDevTools();
            }).on('error', () => {
                setTimeout(waitForServer, 1000);
            });
        };

        waitForServer();
    } else {
        // 生产模式：启动本地 Next.js 服务器
        startNextServer();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// 启动 Next.js 服务器（生产模式）
function startNextServer() {
    const serverPort = 3000;
    const serverUrl = `http://localhost:${serverPort}`;

    // 启动 Next.js 服务器
    nextServer = spawn('node', ['node_modules/next/dist/bin/next', 'start', '-p', serverPort.toString()], {
        cwd: path.join(__dirname, '..'),
        env: { ...process.env, NODE_ENV: 'production' },
        shell: true,
    });

    nextServer.stdout.on('data', (data) => {
        console.log(`Next.js: ${data}`);
    });

    nextServer.stderr.on('data', (data) => {
        console.error(`Next.js Error: ${data}`);
    });

    // 等待服务器启动
    const waitForServer = () => {
        const http = require('http');
        http.get(serverUrl, () => {
            mainWindow.loadURL(serverUrl);
        }).on('error', () => {
            setTimeout(waitForServer, 1000);
        });
    };

    setTimeout(waitForServer, 2000);
}

// IPC 通信处理
ipcMain.handle('get-user-data-path', () => {
    return userDataPath;
});

ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });

    if (result.canceled) {
        return null;
    }

    return result.filePaths[0];
});

ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

// 应用生命周期
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    if (nextServer) {
        nextServer.kill();
    }
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});
