import type { Editor } from '@milkdown/kit/core';
import { editorViewCtx, editorViewOptionsCtx, parserCtx } from '@milkdown/kit/core';
import { Slice } from '@milkdown/kit/prose/model';
import { Crepe } from '@milkdown/crepe';
import { ClientMessage } from './utils/client-message';
import { vscode } from './utils/api';
import { useUploader } from './editor-config/uploader';
import { useListener } from './editor-config/listener';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import { ResourceManager } from './utils/resource-manager';

export class EditorManager {
    private editor: Editor | null = null;
    constructor(private message: ClientMessage) {}

    create = async () => {
        const state = vscode.getState();
        const crepe = new Crepe({
            root: '#app',
            defaultValue: state?.text || '',
            featureConfigs: {
                [Crepe.Feature.CodeMirror]: {
                    theme: document.body.classList.contains('vscode-dark') ? vscodeDark : vscodeLight,
                },
                [Crepe.Feature.ImageBlock]: {
                    proxyDomURL: (originalUrl) => {
                        if (originalUrl.length === 0) {
                            return '';
                        }
                        const promise = ResourceManager.Instance.add(originalUrl);
                        ClientMessage.Instance.getResource(originalUrl);
                        return promise;
                    },
                    onUpload: async (file) => {
                        const readImageAsBase64 = (file: File): Promise<{ alt: string; src: string }> => {
                            return new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.addEventListener(
                                    'load',
                                    () => {
                                        resolve({
                                            alt: file.name,
                                            src: reader.result?.toString().split(',')[1] as string,
                                        });
                                    },
                                    false,
                                );
                                reader.readAsDataURL(file);
                            });
                        };
                        const { src: base64 } = await readImageAsBase64(file);
                        const url = file.name;
                        this.message.upload(url, base64);
                        return url;
                    },
                },
            },
        });
        useListener(crepe, this.message);
        const { editor } = crepe;
        useUploader(editor, this.message);

        await crepe.create();

        this.editor = editor;

        return editor;
    };

    update = (markdown: string): boolean => {
        if (!this.editor) return false;
        const text = vscode.getState()?.text;
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
}
