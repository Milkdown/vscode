import { Editor, editorViewCtx, parserCtx } from '@milkdown/kit/core';
import { Slice } from '@milkdown/kit/prose/model';
import { Crepe } from '@milkdown/crepe';
import { ClientMessage } from './utils/client-message';
import { vscode } from './utils/api';
import { useUploader } from './editor-config/uploader';
import { useListener } from './editor-config/listener';

export class EditorManager {
    private editor: Editor | null = null;
    constructor(private message: ClientMessage) {}

    create = async () => {
        const state = vscode.getState();
        console.log(state)
        const crepe = new Crepe({
            root: '#app',
            defaultValue: state?.text || '',
        });
        const { editor } = crepe;
        useListener(editor, this.message, () => {
            console.log('onUpdate');
        });
        useUploader(editor, this.message);

        await crepe.create();

        this.editor = editor;

        return editor;
    };

    update = (markdown: string): boolean => {
        if (!this.editor) return false;
        const text = vscode.getState()?.text;
        console.log(text)
        if (typeof markdown !== 'string' || text === markdown) return false;

        return this.editor.action((ctx) => {
            const view = ctx.get(editorViewCtx);
            const parser = ctx.get(parserCtx);

            const doc = parser(markdown);
            if (!doc) {
                return false;
            }
            const state = view.state;
            view.dispatch(state.tr.replace(0, state.doc.content.size, new Slice(doc.content, 0, 0)));
            vscode.setState({ text: markdown });
            return true;
        });
    };

    flush = () => {
        // if (!this.editor) return;
        // return this.editor.action(async (ctx) => {
        //     const root = ctx.get(rootCtx);
        //     const rootEl = typeof root === 'string' ? document.querySelector(root) : root;
        //     if (rootEl instanceof HTMLElement) {
        //         rootEl.firstElementChild?.remove();
        //     }
        //     await this.create();
        // });
    };
}
