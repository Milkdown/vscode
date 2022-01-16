export class ClientMessage {
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
}
