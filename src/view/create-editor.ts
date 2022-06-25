import { defaultValueCtx, Editor, rootCtx } from '@milkdown/core';
import { clipboard } from '@milkdown/plugin-clipboard';
import { emoji } from '@milkdown/plugin-emoji';
import { history } from '@milkdown/plugin-history';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { math } from '@milkdown/plugin-math';
import { prism } from '@milkdown/plugin-prism';
import { slash } from '@milkdown/plugin-slash';
import { tooltip } from '@milkdown/plugin-tooltip';
import { gfm } from '@milkdown/preset-gfm';
import { indent } from '@milkdown/plugin-indent';
import { trailing } from '@milkdown/plugin-trailing';
import { cursor } from '@milkdown/plugin-cursor';

import { vscode as vscodeTheme } from '../theme-vscode';
import { ClientMessage } from './client-message';

import 'katex/dist/katex.min.js';

export const createEditor = (vscode: any, message: ClientMessage) =>
    Editor.make()
        .config((ctx) => {
            ctx.set(rootCtx, document.getElementById('app'));
            const state = vscode.getState();
            if (state?.text) {
                ctx.set(defaultValueCtx, state.text);
            }
            ctx.get(listenerCtx)
                .markdownUpdated((_, markdown) => {
                    vscode.setState({ text: markdown });
                    message.update(markdown);
                })
                .focus(() => {
                    message.focus();
                })
                .blur(() => {
                    message.blur();
                })
                .mounted(() => {
                    message.ready();
                });
        })
        .use(vscodeTheme)
        .use(gfm)
        .use(math)
        .use(slash)
        .use(tooltip)
        .use(history)
        .use(listener)
        .use(emoji)
        .use(clipboard)
        .use(prism)
        .use(indent)
        .use(cursor)
        .use(trailing)
        .create();
