import { ClientMessage } from './client-message';
import { EditorManager } from './editor-manager';
import { ResourceManager } from './resource-manager';

// @ts-ignore
const vscode = acquireVsCodeApi();

function main() {
    const resource = new ResourceManager();
    const message = new ClientMessage(vscode);
    const editor = new EditorManager(vscode, message, resource);

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
            case 'resource-response': {
                resource.resolve(message.origin, message.result);
                return;
            }
        }
    });

    editor.create();
}

main();
