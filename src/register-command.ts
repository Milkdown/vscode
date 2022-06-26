import * as vscode from 'vscode';
import { getHtmlTemplateForWebView } from './template.html';

const commands = [
    'extension.milkdown.bold',
    'extension.milkdown.italic',
    'extension.milkdown.inline_code',
    'extension.milkdown.strike_through',
    'extension.milkdown.text',
    'extension.milkdown.h1',
    'extension.milkdown.h2',
    'extension.milkdown.h3',
    'extension.milkdown.h4',
    'extension.milkdown.h5',
    'extension.milkdown.h6',
    'extension.milkdown.ordered_list',
    'extension.milkdown.bullet_list',
    'extension.milkdown.task_list',
    'extension.milkdown.code',
    'extension.milkdown.lift',
    'extension.milkdown.sink',
    'extension.milkdown.exit_block',
    'extension.milkdown.line_break',
    'extension.milkdown.tab',
    'extension.milkdown.undo',
    'extension.milkdown.redo',
];

export function registerCommand(viewType: string): void {
    commands.forEach((command) => {
        vscode.commands.registerCommand(command, () => {});
    });

    vscode.commands.registerCommand(
        'milkdown.open',
        (uri: vscode.Uri | undefined = vscode.window.activeTextEditor?.document.uri) => {
            if (!uri) {
                console.error('Cannot get url');
                return;
            }

            vscode.commands.executeCommand('vscode.openWith', uri, viewType);
        },
    );
}
