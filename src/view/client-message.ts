/* Copyright 2021, Milkdown by Mirone.*/
export class ClientMessage {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(private vscode: any) {}

    update = (content: string) => {
        this.vscode.postMessage({
            type: 'client-update',
            content,
        });
    };

    focus = () => {
        this.vscode.postMessage({
            type: 'client-focus',
        });
    };

    blur = () => {
        this.vscode.postMessage({
            type: 'client-blur',
        });
    };

    ready = () => {
        this.vscode.postMessage({
            type: 'client-ready',
        });
    };

    getResource = (url: string) => {
        this.vscode.postMessage({
            type: 'client-get-resource',
            url,
        });
    };
}
