/* Copyright 2021, Milkdown by Mirone.*/
import type { Ctx } from '@milkdown/kit/ctx';
import { editorViewCtx, serializerCtx } from '@milkdown/kit/core';
import { vscode } from '../utils/api';
import type { ClientMessage } from '../utils/client-message';
import type { Crepe } from '@milkdown/crepe';

let prev = '';

function getMarkdownFromCtx(ctx: Ctx) {
    const serializer = ctx.get(serializerCtx);
    const view = ctx.get(editorViewCtx);
    return serializer(view.state.doc);
}

export const useListener = (crepe: Crepe, message: ClientMessage) => {
    crepe.on((api) => {
        api.updated((ctx) => {
            const markdown = getMarkdownFromCtx(ctx);
            if (prev === markdown) return;
            prev = markdown;
            vscode.setState({ text: markdown });
            message.update(markdown);
        })
            .focus(() => {
                message.focus();
            })
            .blur(() => {
                message.blur();
            })
            .mounted((ctx) => {
                const markdown = getMarkdownFromCtx(ctx);
                prev = markdown;
                message.ready();
            });
    });
};
