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
        vscode.commands.registerCommand('extension.milkdown.bold', () => {});
        vscode.commands.registerCommand('extension.milkdown.italic', () => {});
        vscode.commands.registerCommand('extension.milkdown.inline_code', () => {});
        vscode.commands.registerCommand('extension.milkdown.strike_through', () => {});
        vscode.commands.registerCommand('extension.milkdown.text', () => {});
        vscode.commands.registerCommand('extension.milkdown.h1', () => {});
        vscode.commands.registerCommand('extension.milkdown.h2', () => {});
        vscode.commands.registerCommand('extension.milkdown.h3', () => {});
        vscode.commands.registerCommand('extension.milkdown.h4', () => {});
        vscode.commands.registerCommand('extension.milkdown.h5', () => {});
        vscode.commands.registerCommand('extension.milkdown.h6', () => {});
        vscode.commands.registerCommand('extension.milkdown.ordered_list', () => {});
        vscode.commands.registerCommand('extension.milkdown.bullet_list', () => {});
        vscode.commands.registerCommand('extension.milkdown.task_list', () => {});
        vscode.commands.registerCommand('extension.milkdown.code', () => {});
        vscode.commands.registerCommand('extension.milkdown.lift', () => {});
        vscode.commands.registerCommand('extension.milkdown.sink', () => {});
        vscode.commands.registerCommand('extension.milkdown.exit_block', () => {});
        vscode.commands.registerCommand('extension.milkdown.line_break', () => {});

        const provider = new MilkdownEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(
            MilkdownEditorProvider.viewType,
            provider,
        );
        return providerRegistration;
    }

    public static readonly viewType = 'milkdown.editor';

    constructor(private readonly context: vscode.ExtensionContext) {}

    private clientIsFocus = false;

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken,
    ): Promise<void> {
        webviewPanel.webview.options = { enableScripts: true };
        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

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

        vscode.window.onDidChangeActiveColorTheme(() => {
            webviewPanel.webview.postMessage({
                type: 'restart',
            });
        });

        webviewPanel.webview.onDidReceiveMessage((e) => {
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

    private getHtmlForWebview(webview: vscode.Webview): string {
        return getHtmlTemplateForWebView(webview, this.context.extensionUri);
    }

    private updateDocument(document: vscode.TextDocument, nextMarkdown: string) {
        const text = document.getText();
        if (text === nextMarkdown) return;

        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), nextMarkdown);
        vscode.workspace.applyEdit(edit);
    }
}
