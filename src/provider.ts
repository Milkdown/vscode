import * as vscode from 'vscode';
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
    private clientIsVisible = false;

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken,
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

        webviewPanel.onDidChangeViewState((e) => {
            this.clientIsVisible = e.webviewPanel.visible;
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
            console.log('Receive Event: ', e.type);
            switch (e.type) {
                case 'client-update':
                    const nextMarkdown = e.content;
                    this.updateDocument(document, nextMarkdown);
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
}
