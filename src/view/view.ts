import { ClientMessage } from './utils/client-message';
import { EditorManager } from './editor-manager';
import { ResourceManager } from './utils/resource-manager';

function setupModeToggle(editor: EditorManager) {
    const container = document.querySelector('[data-mode-toggle]');
    if (!container) {
        return;
    }
    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('button[data-mode]'));

    const setActive = (mode: 'edit' | 'view') => {
        buttons.forEach((button) => {
            button.classList.toggle('active', (button.dataset.mode as 'edit' | 'view') === mode);
        });
    };

    setActive(editor.getMode());

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const targetMode = (button.dataset.mode as 'edit' | 'view') ?? 'edit';
            editor.setMode(targetMode);
            setActive(targetMode);
        });
    });
}

function main() {
    const message = new ClientMessage();
    const editor = new EditorManager(message);

    editor.create().then(() => {
        setupModeToggle(editor);
    });

    window.addEventListener('message', (event) => {
        const message = event.data;
        switch (message.type) {
            case 'update': {
                const text = message.text;
                editor.update(text);
                return;
            }
            case 'resource-response': {
                ResourceManager.Instance.resolve(message.origin, message.result);
                return;
            }
        }
    });
}

main();
