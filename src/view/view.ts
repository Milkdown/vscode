import { ClientMessage } from './utils/client-message';
import { EditorManager } from './editor-manager';
import { ResourceManager } from './utils/resource-manager';

type WidthMode = 'default' | 'full';
const widthModeStorageKey = 'milkdown-width-mode';

document.body.classList.add('width-mode-default');

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

function setupWidthToggle() {
    const button = document.querySelector<HTMLButtonElement>('[data-width-toggle]');
    if (!button) {
        return;
    }

    const safeStorage = (): Storage | null => {
        try {
            return window.localStorage;
        } catch {
            return null;
        }
    };

    const storage = safeStorage();
    const readStoredMode = (): WidthMode => {
        if (!storage) {
            return 'default';
        }
        const stored = storage.getItem(widthModeStorageKey);
        return stored === 'full' ? 'full' : 'default';
    };

    let currentMode: WidthMode = readStoredMode();

    const applyMode = (mode: WidthMode) => {
        document.body.classList.toggle('width-mode-default', mode === 'default');
        document.body.classList.toggle('width-mode-full', mode === 'full');
        button.classList.toggle('active', mode === 'full');
    };

    applyMode(currentMode);

    button.addEventListener('click', () => {
        currentMode = currentMode === 'full' ? 'default' : 'full';
        applyMode(currentMode);
        if (storage) {
            storage.setItem(widthModeStorageKey, currentMode);
        }
    });
}

function main() {
    const message = new ClientMessage();
    const editor = new EditorManager(message);

    setupWidthToggle();

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
