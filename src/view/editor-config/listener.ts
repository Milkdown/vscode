/* Copyright 2021, Milkdown by Mirone.*/
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { Ctx } from '@milkdown/ctx';
import { Editor } from '@milkdown/core';
import { vscode } from '../utils/api';
import { ClientMessage } from '../utils/client-message';

export const useListener = (editor: Editor, message: ClientMessage, onUpdate: (ctx: Ctx) => void) => {
    editor
        .config((ctx) => {
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
        })
        .use(listener);
};
