/* Copyright 2021, Milkdown by Mirone.*/
import { defaultValueCtx, Editor, rootCtx } from '@milkdown/core';
import { clipboard } from '@milkdown/plugin-clipboard';
import { cursor } from '@milkdown/plugin-cursor';
import { emoji } from '@milkdown/plugin-emoji';
import { history } from '@milkdown/plugin-history';
import { indent, indentPlugin } from '@milkdown/plugin-indent';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { math } from '@milkdown/plugin-math';
import { prism } from '@milkdown/plugin-prism';
import { slash } from '@milkdown/plugin-slash';
import { tooltip } from '@milkdown/plugin-tooltip';
import { trailing } from '@milkdown/plugin-trailing';
import { gfm, image } from '@milkdown/preset-gfm';

import { vscodeTheme } from '../theme-vscode';
import { vsImage } from './vs-image';
import type { ClientMessage } from './client-message';
import type { ResourceManager } from './resource-manager';

import 'katex/dist/katex.min.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createEditor = (vscode: any, message: ClientMessage, resource: ResourceManager) =>
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
        .use(vscodeTheme())
        .use(gfm.replace(image, vsImage(message, resource)()))
        .use(math)
        .use(slash)
        .use(tooltip)
        .use(history)
        .use(listener)
        .use(emoji)
        .use(clipboard)
        .use(prism)
        .use(
            indent.configure(indentPlugin, {
                type: 'space',
            }),
        )
        .use(cursor)
        .use(trailing)
        .create();
