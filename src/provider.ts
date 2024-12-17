import * as vscode from 'vscode';
import { join } from 'path';
import { registerCommand } from './register-command';
import { getHtmlTemplateForWebView } from './template.html';

export class MilkdownEditorProvider implements vscode.CustomTextEditorProvider {
    public static readonly viewType = 'milkdown.editor';
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        registerCommand(MilkdownEditorProvider.viewType);

        const provider = new MilkdownEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(
            MilkdownEditorProvider.viewType,
            provider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true,
                },
            },
        );
        return providerRegistration;
    }

    private static getHtmlForWebview(context: vscode.ExtensionContext, webview: vscode.Webview): string {
        return getHtmlTemplateForWebView(webview, context.extensionUri);
    }

    constructor(private readonly context: vscode.ExtensionContext) {}

    private clientIsFocus = false;

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
    ): Promise<void> {
        webviewPanel.webview.options = { enableScripts: true };
        webviewPanel.webview.html = MilkdownEditorProvider.getHtmlForWebview(this.context, webviewPanel.webview);

        const updateWebview = () => {
            const text = document.getText();
            webviewPanel.webview.postMessage({
                type: 'update',
                text,
            });
        };

        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
            if (e.document.uri.toString() === document.uri.toString() && !this.clientIsFocus) {
                updateWebview();
            }
        });

        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });

        webviewPanel.webview.onDidReceiveMessage((e) => {
            switch (e.type) {
                case 'client-update':
                    if (webviewPanel.active && webviewPanel.visible) {
                        const nextMarkdown = e.content;
                        this.updateDocument(document, nextMarkdown);
                    }
                    return;
                case 'client-focus':
                    this.clientIsFocus = true;
                    vscode.commands.executeCommand('setContext', 'milkdown.active', true);
                    return;
                case 'client-blur':
                    this.clientIsFocus = false;
                    vscode.commands.executeCommand('setContext', 'milkdown.active', false);
                    return;
                case 'client-ready':
                    updateWebview();
                    return;
                case 'client-get-resource': {
                    const transformedUri = this.getResourceUri(webviewPanel.webview, document, e.url);
                    webviewPanel.webview.postMessage({
                        type: 'resource-response',
                        origin: e.url,
                        result: transformedUri,
                    });
                    return;
                }
                case 'client-upload': {
                    this.uploadFile(webviewPanel.webview, document, e.base64, e.url).then(() => {
                        const transformedUri = this.getResourceUri(webviewPanel.webview, document, e.url);
                        webviewPanel.webview.postMessage({
                            type: 'resource-response',
                            origin: e.url,
                            result: transformedUri,
                        });
                    });
                    return;
                }
            }
        });
    }

    private updateDocument(document: vscode.TextDocument, nextMarkdown: string) {
        const text = document.getText();
        if (text === nextMarkdown) return;

        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), nextMarkdown);
        vscode.workspace.applyEdit(edit);
    }

    private getResourceUri(webview: vscode.Webview, document: vscode.TextDocument, url: string): string {
        if (!/^[a-z-]+:/i.test(url)) {
            const root = vscode.workspace.getWorkspaceFolder(document.uri);
            let uri = vscode.Uri.parse('markdown-link:' + url);
            if (root) {
                uri = vscode.Uri.joinPath(root.uri, uri.fsPath).with({
                    fragment: uri.fragment,
                    query: uri.query,
                });
                return webview.asWebviewUri(uri).toString(true);
            }
        }
        return url;
    }

    private async uploadFile(webview: vscode.Webview, document: vscode.TextDocument, base64: string, name: string) {
        const root = vscode.workspace.getWorkspaceFolder(document.uri)?.uri.fsPath;
        if (!root) return;
        const content = Buffer.from(base64, 'base64');
        await vscode.workspace.fs.writeFile(vscode.Uri.file(join(root, name)), content);
    }
}
