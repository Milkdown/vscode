import { Editor, editorViewCtx, emotionCtx, parserCtx, rootCtx } from '@milkdown/core';
import { Slice } from '@milkdown/prose/model';
import { switchTheme } from '@milkdown/utils';
import { vscodeTheme } from '../theme-vscode';
import { ClientMessage } from './client-message';
import { createEditor } from './create-editor';

export class EditorManager {
    private editor: Editor | null = null;
    constructor(private vscode: any, private message: ClientMessage) {}

    create = async () => {
        const $ = await createEditor(this.vscode, this.message);
        this.editor = $;

        return $;
    };

    update = (markdown: string): boolean => {
        if (!this.editor) return false;
        const text = this.vscode.getState()?.text;
        if (typeof markdown !== 'string' || text === markdown) return false;

        return this.editor.action((ctx) => {
            const view = ctx.get(editorViewCtx);
            const parser = ctx.get(parserCtx);

            const doc = parser(markdown);
            if (!doc) {
                return false;
            }
            const state = view.state;
            view.dispatch(
                state.tr
                    .setMeta('addToHistory', false)
                    .replace(0, state.doc.content.size, new Slice(doc.content, 0, 0)),
            );
            this.vscode.setState({ text: markdown });
            return true;
        });
    };

    flush = () => {
        if (!this.editor) return;
        return this.editor.action(switchTheme(vscodeTheme()));
    };
}
