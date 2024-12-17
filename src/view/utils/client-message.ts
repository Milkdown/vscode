/* Copyright 2021, Milkdown by Mirone.*/
import { vscode } from './api';

export class ClientMessage {
    private static instance: ClientMessage;
    static get Instance() {
        if (!ClientMessage.instance) {
            ClientMessage.instance = new ClientMessage();
        }

        return ClientMessage.instance;
    }

    update = (content: string) => {
        vscode.postMessage({
            type: 'client-update',
            content,
        });
    };

    focus = () => {
        vscode.postMessage({
            type: 'client-focus',
        });
    };

    blur = () => {
        vscode.postMessage({
            type: 'client-blur',
        });
    };

    ready = () => {
        vscode.postMessage({
            type: 'client-ready',
        });
    };

    getResource = (url: string) => {
        vscode.postMessage({
            type: 'client-get-resource',
            url,
        });
    };

    upload = (url: string, base64: string) => {
        vscode.postMessage({
            type: 'client-upload',
            url,
            base64,
        });
    };
}
