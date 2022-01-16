import * as vscode from 'vscode';

export const registerMessageHandler = (panel: vscode.WebviewPanel) => {
    panel.webview.onDidReceiveMessage((e) => {
        switch (e.type) {
            case 'update':
                // this.clientLock = true;
                // this.updateDocument(document, e.content);
                return;
            case 'ready':
                // this.clientLock = false;
                // this.content = '';
                // updateWebview();
                return;
        }
    });
};
