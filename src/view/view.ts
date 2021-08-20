import { Slice } from 'prosemirror-model';
import { nord } from '@milkdown/theme-nord';
import { Editor, rootCtx, editorViewCtx, parserCtx, defaultValueCtx } from '@milkdown/core';
import { gfm } from '@milkdown/preset-gfm';
import { tooltip } from '@milkdown/plugin-tooltip';
import { slash } from '@milkdown/plugin-slash';
import { history } from '@milkdown/plugin-history';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { clipboard } from '@milkdown/plugin-clipboard';
import { emoji } from '@milkdown/plugin-emoji';
import { prism } from '@milkdown/plugin-prism';

const debounce = <T extends unknown[]>(func: (...args: T) => void, delay: number) => {
    let timer: number;
    return (...args: T) => {
        clearTimeout(timer);
        timer = window.setTimeout(() => {
            func.apply(undefined, args);
        }, delay);
    };
};

let contentCache = '';
let serverLock = false;

// @ts-ignore
const vscode = acquireVsCodeApi();

const createEditor = () =>
    Editor.make()
        .config((ctx) => {
            ctx.set(rootCtx, document.getElementById('app'));
            const state = vscode.getState();
            if (state?.text) {
                ctx.set(defaultValueCtx, state.text);
            }
            ctx.set(listenerCtx, {
                markdown: [
                    debounce((getDoc: () => string) => {
                        if (serverLock) {
                            serverLock = false;
                            return;
                        }
                        const text = getDoc();
                        if (contentCache === text) return;
                        contentCache = text;
                        vscode.setState({ text });
                        vscode.postMessage({
                            type: 'update',
                            content: text,
                        });
                    }, 200),
                ],
            });
        })
        .use(nord)
        .use(gfm)
        .use(slash)
        .use(tooltip)
        .use(history)
        .use(listener)
        .use(emoji)
        .use(clipboard)
        .use(prism)
        .create();

const changeTheme = (target: Node) => {
    if (target instanceof HTMLElement) {
        const isDark = target.classList.contains('vscode-dark');
        document.body.dataset.theme = isDark ? 'dark' : 'light';
    }
};

async function main() {
    const editor = await createEditor();

    changeTheme(document.body);

    const observer = new MutationObserver(function (mutations) {
        mutations.forEach((mutationRecord) => {
            changeTheme(mutationRecord.target);
        });
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    const updateEditor = (markdown: string) => {
        if (typeof markdown !== 'string') return;
        editor.action((ctx) => {
            const view = ctx.get(editorViewCtx);
            const parser = ctx.get(parserCtx);
            const doc = parser(markdown);
            if (!doc) {
                return;
            }
            contentCache = markdown;
            const state = view.state;
            view.dispatch(state.tr.replace(0, state.doc.content.size, new Slice(doc.content, 0, 0)));
        });
    };

    window.addEventListener('message', (event) => {
        const message = event.data;
        switch (message.type) {
            case 'update': {
                const text = message.text;
                if (text === contentCache) return;
                serverLock = true;
                console.log('-------update-------');
                console.log(text);
                console.log(contentCache);

                updateEditor(text);
                vscode.setState({ text });

                return;
            }
        }
    });
}

main();
