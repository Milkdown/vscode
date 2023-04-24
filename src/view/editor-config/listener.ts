/* Copyright 2021, Milkdown by Mirone.*/
import { listenerCtx } from '@milkdown/plugin-listener';
import { vscode } from '../utils/api';
import { Ctx } from '@milkdown/ctx';
import { ClientMessage } from '../utils/client-message';

export const useListener = (ctx: Ctx, message: ClientMessage, onUpdate: (ctx: Ctx) => void) => {
    ctx.get(listenerCtx)
        .markdownUpdated((ctx, markdown) => {
            vscode.setState({ text: markdown });
            message.update(markdown);

            onUpdate(ctx);
        })
        .focus(() => {
            message.focus();
        })
        .blur(() => {
            message.blur();
        })
        .mounted(() => {
            message.ready();

            onUpdate(ctx);
        });
};
