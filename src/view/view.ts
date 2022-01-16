import { Slice } from 'prosemirror-model';
import { vscode as vscodeTheme } from '../theme-vscode/index';
import { Editor, rootCtx, editorViewCtx, parserCtx, defaultValueCtx } from '@milkdown/core';
import { gfm } from '@milkdown/preset-gfm';
import { tooltip } from '@milkdown/plugin-tooltip';
import { slash } from '@milkdown/plugin-slash';
import { history } from '@milkdown/plugin-history';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { clipboard } from '@milkdown/plugin-clipboard';
import { emoji } from '@milkdown/plugin-emoji';
import { prism } from '@milkdown/plugin-prism';
import { math } from '@milkdown/plugin-math';

import 'katex/dist/katex.min';

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
            ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
                if (serverLock) {
                    serverLock = false;
                    return;
                }
                vscode.setState({ text: markdown });
                vscode.postMessage({
                    type: 'update',
                    content: markdown,
                });
            });
        })
        .use(vscodeTheme())
        .use(gfm)
        .use(math)
        .use(slash)
        .use(tooltip)
        .use(history)
        .use(listener)
        .use(emoji)
        .use(clipboard)
        .use(prism)
        .create();

async function main() {
    let editor = await createEditor();

    vscode.postMessage({
        type: 'ready',
    });

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

    const restartEditor = () => {
        editor.action(async (ctx) => {
            const view = ctx.get(editorViewCtx);
            view.dom.parentElement?.remove();
            editor = await createEditor();
            vscode.postMessage({
                type: 'ready',
            });
        });
    };

    window.addEventListener('message', (event) => {
        const message = event.data;
        switch (message.type) {
            case 'update': {
                const text = message.text;
                if (text === contentCache) return;
                serverLock = true;

                updateEditor(text);
                vscode.setState({ text });

                return;
            }
            case 'restart': {
                restartEditor();
                return;
            }
        }
    });
}

main();
