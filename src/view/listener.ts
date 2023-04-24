/* Copyright 2021, Milkdown by Mirone.*/
import { listenerCtx } from '@milkdown/plugin-listener';
import { vscode } from './api';
import { Ctx } from '@milkdown/ctx';
import { ClientMessage } from './client-message';

export const useListener = (ctx: Ctx, message: ClientMessage) => {
    ctx.get(listenerCtx)
        .markdownUpdated((ctx, markdown) => {
            vscode.setState({ text: markdown });
            message.update(markdown);

            // requestAnimationFrame(() => {
            // renderOutline(ctx);
            // });
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
};
