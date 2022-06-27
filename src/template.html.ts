/* Copyright 2021, Milkdown by Mirone.*/
import * as vscode from 'vscode';
import { getNonce } from './get-nonce';

export const getHtmlTemplateForWebView = (webview: vscode.Webview, extensionUri: vscode.Uri) => {
    const getMediaUri = (fileName: string) =>
        webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', fileName));

    const scriptUri = getMediaUri('view.js');
    const styleUri = getMediaUri('style.css');
    const nonce = getNonce();

    return /* html */ `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
				-->
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet" />
				<title>Milkdown</title>
			</head>
			<body>
                <div id="app">
                    <div id="editor"></div>
                    <ul id="outline"></ul>
                </div>

                <script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
};
