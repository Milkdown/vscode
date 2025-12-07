import * as vscode from 'vscode';

const commands = [
    'extension.milkdownViewer.bold',
    'extension.milkdownViewer.italic',
    'extension.milkdownViewer.inline_code',
    'extension.milkdownViewer.strike_through',
    'extension.milkdownViewer.text',
    'extension.milkdownViewer.h1',
    'extension.milkdownViewer.h2',
    'extension.milkdownViewer.h3',
    'extension.milkdownViewer.h4',
    'extension.milkdownViewer.h5',
    'extension.milkdownViewer.h6',
    'extension.milkdownViewer.ordered_list',
    'extension.milkdownViewer.bullet_list',
    'extension.milkdownViewer.task_list',
    'extension.milkdownViewer.code',
    'extension.milkdownViewer.lift',
    'extension.milkdownViewer.sink',
    'extension.milkdownViewer.exit_block',
    'extension.milkdownViewer.line_break',
    'extension.milkdownViewer.tab',
    'extension.milkdownViewer.undo',
    'extension.milkdownViewer.redo',
];

export function registerCommand(): void {
    commands.forEach((command) => {
        vscode.commands.registerCommand(command, () => {
            // Nothing to do here
        });
    });
}
