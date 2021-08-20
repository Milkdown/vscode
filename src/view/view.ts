import { Slice } from 'prosemirror-model';
import { nord } from '@milkdown/theme-nord';
import { Editor, rootCtx, editorViewCtx, parserCtx } from '@milkdown/core';
import { gfm } from '@milkdown/preset-gfm';
import { tooltip } from '@milkdown/plugin-tooltip';
import { slash } from '@milkdown/plugin-slash';

console.log('----loading milkdown----');

const createEditor = () =>
    Editor.make()
        .config((ctx) => {
            ctx.set(rootCtx, document.getElementById('app'));
        })
        .use(nord)
        .use(gfm)
        .use(slash)
        .use(tooltip)
        .create();

async function main() {
    // @ts-ignore
    const vscode = acquireVsCodeApi();

    const editor = await createEditor();

    //TODO: set by theme
    document.body.dataset.theme = 'dark';

    console.log('---create editor success---');

    const updateEditor = (markdown: string) => {
        editor.action((ctx) => {
            console.log('---update editor---');
            const view = ctx.get(editorViewCtx);
            const parser = ctx.get(parserCtx);
            const doc = parser(markdown);
            if (!doc) {
                return;
            }
            const state = view.state;
            view.dispatch(state.tr.replace(0, state.doc.content.size, new Slice(doc.content, 0, 0)));
        });
    };

    window.addEventListener('message', (event) => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'update': {
                const text = message.text;

                // Update our webview's content
                updateEditor(text);

                // Then persist state information.
                // This state is returned in the call to `vscode.getState` below when a webview is reloaded.
                vscode.setState({ text });

                return;
            }
        }
    });
}

main();
