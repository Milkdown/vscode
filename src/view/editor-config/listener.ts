/* Copyright 2021, Milkdown by Mirone.*/
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener';
import { Ctx } from '@milkdown/kit/ctx';
import { Editor, editorViewCtx, serializerCtx } from '@milkdown/kit/core';
import { vscode } from '../utils/api';
import { ClientMessage } from '../utils/client-message';
import throttle from 'lodash.throttle';

let prev = '';

function getMarkdownFromCtx(ctx: Ctx) {
    const serializer = ctx.get(serializerCtx);
    const view = ctx.get(editorViewCtx);
    return serializer(view.state.doc);
}

export const useListener = (editor: Editor, message: ClientMessage) => {
    editor
        .config((ctx) => {
            ctx.get(listenerCtx)
                .updated(
                    throttle((ctx) => {
                        const markdown = getMarkdownFromCtx(ctx);
                        if (prev === markdown) return;
                        prev = markdown;
                        vscode.setState({ text: markdown });
                        message.update(markdown);
                    }, 1000),
                )
                .focus(() => {
                    message.focus();
                })
                .blur(() => {
                    message.blur();
                })
                .mounted(() => {
                    const markdown = getMarkdownFromCtx(ctx);
                    prev = markdown;
                    message.ready();
                });
        })
        .use(listener);
};
