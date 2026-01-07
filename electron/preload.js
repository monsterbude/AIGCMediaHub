const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electron', {
    // 获取用户数据路径
    getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),

    // 选择目录对话框
    selectDirectory: () => ipcRenderer.invoke('select-directory'),

    // 获取应用版本
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),

    // 标识当前运行环境
    isElectron: true,
});
