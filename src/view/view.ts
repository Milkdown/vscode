/* Copyright 2021, Milkdown by Mirone.*/
import { ClientMessage } from './client-message';
import { EditorManager } from './editor-manager';
import { ResourceManager } from './resource-manager';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vscode = (globalThis as any).acquireVsCodeApi();

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
