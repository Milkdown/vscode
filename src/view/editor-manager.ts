import { Editor, editorViewCtx, parserCtx, rootCtx } from '@milkdown/core';
import { Slice } from '@milkdown/prose';
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
        if (typeof markdown !== 'string') return false;

        return this.editor.action((ctx) => {
            const view = ctx.get(editorViewCtx);
            const parser = ctx.get(parserCtx);
            const doc = parser(markdown);
            if (!doc) {
                return false;
            }
            const state = view.state;
            view.dispatch(state.tr.replace(0, state.doc.content.size, new Slice(doc.content, 0, 0)));
            this.vscode.setState({ text: markdown });
            return true;
        });
    };

    flush = () => {
        if (!this.editor) return;
        return this.editor.action(async (ctx) => {
            const root = ctx.get(rootCtx);
            const rootEl = typeof root === 'string' ? document.querySelector(root) : root;
            if (rootEl instanceof HTMLElement) {
                rootEl.firstElementChild?.remove();
            }
            await this.create();
        });
    };
}
