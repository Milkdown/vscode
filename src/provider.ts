import * as vscode from 'vscode';
import { getHtmlTemplateForWebView } from './template.html';

export class MilkdownEditorProvider implements vscode.CustomTextEditorProvider {
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        vscode.commands.registerCommand('milkdown.open', (uri?: vscode.Uri) => {
            let url = uri;
            if (!url) {
                url = vscode.window.activeTextEditor?.document.uri;
            }
            console.log(url);
            if (!url) {
                console.error('Cannot get url');
                return;
            }

            vscode.commands.executeCommand('vscode.openWith', url, MilkdownEditorProvider.viewType);
        });

        const provider = new MilkdownEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(
            MilkdownEditorProvider.viewType,
            provider,
        );
        return providerRegistration;
    }

    public static readonly viewType = 'milkdown.editor';

    constructor(private readonly context: vscode.ExtensionContext) {}

    private content = '';
    private clientLock = false;

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken,
    ): Promise<void> {
        webviewPanel.webview.options = { enableScripts: true };
        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

        const updateWebview = () => {
            const text = document.getText();
            if (text === this.content) return;
            webviewPanel.webview.postMessage({
                type: 'update',
                text,
            });
        };

        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
            console.log('--------changeDocumentSubscription----------');
            if (this.clientLock) {
                this.clientLock = false;
                return;
            }
            if (e.document.uri.toString() === document.uri.toString()) {
                updateWebview();
            }
        });

        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });

        vscode.window.onDidChangeActiveColorTheme(() => {
            webviewPanel.webview.postMessage({
                type: 'restart',
            });
        });

        webviewPanel.webview.onDidReceiveMessage((e) => {
            switch (e.type) {
                case 'update':
                    this.clientLock = true;
                    this.updateDocument(document, e.content);
                    return;
                case 'ready':
                    this.clientLock = false;
                    this.content = '';
                    updateWebview();
                    return;
            }
        });
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        return getHtmlTemplateForWebView(webview, this.context.extensionUri);
    }

    private updateDocument(document: vscode.TextDocument, content: string) {
        const text = document.getText();
        if (text === content) return;
        this.content = content;
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), content);
        vscode.workspace.applyEdit(edit);
    }
}
