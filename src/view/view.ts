import { ClientMessage } from './client-message';
import { EditorManager } from './editor-manager';

// @ts-ignore
const vscode = acquireVsCodeApi();

const loading = document.getElementById('loading');

function main() {
    const message = new ClientMessage(vscode);
    const editor = new EditorManager(vscode, message);

    window.addEventListener('message', (event) => {
        const message = event.data;
        switch (message.type) {
            case 'update': {
                const text = message.text;
                editor.update(text);
                return;
            }
            case 'flush-theme': {
                editor.flush();
                return;
            }
        }
    });

    editor.create();
}

main();
