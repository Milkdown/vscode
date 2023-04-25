/* Copyright 2021, Milkdown by Mirone.*/
import { Editor } from '@milkdown/core';
import { cursor, dropCursorConfig } from '@milkdown/plugin-cursor';

export const useCursor = (editor: Editor) => {
    editor
        .config((ctx) => {
            ctx.set(dropCursorConfig.key, {
                color: 'var(--vscode-editorCursor-foreground)',
            });
        })
        .use(cursor);
};
