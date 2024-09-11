import { ClientMessage } from './utils/client-message';
import { EditorManager } from './editor-manager';

function main() {
    const message = new ClientMessage();
    const editor = new EditorManager(message);

    editor.create();

    window.addEventListener('message', (event) => {
        const message = event.data;
        switch (message.type) {
            case 'update': {
                const text = message.text;
                editor.update(text);
                return;
            }
            case 'restart': {
                editor.flush();
                return;
            }
        }
    });
}

main();
