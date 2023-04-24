/* Copyright 2021, Milkdown by Mirone.*/
import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { RefOrCallback } from 'lit/directives/ref.js';
import { ShallowLitElement, useNodeViewFactory } from '@prosemirror-adapter/lit';
import { ref } from 'lit/directives/ref.js';
import { defaultValueCtx, Editor as Milkdown, editorViewCtx, parserCtx, rootCtx } from '@milkdown/core';
import { commonmark, imageSchema } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { math } from '@milkdown/plugin-math';
import { history } from '@milkdown/plugin-history';
import { listener } from '@milkdown/plugin-listener';
import { emoji } from '@milkdown/plugin-emoji';
import { clipboard } from '@milkdown/plugin-clipboard';
import { prism } from '@milkdown/plugin-prism';
import { indent } from '@milkdown/plugin-indent';
import { cursor } from '@milkdown/plugin-cursor';
import { trailing } from '@milkdown/plugin-trailing';
import { upload } from '@milkdown/plugin-upload';
import { $view, outline } from '@milkdown/utils';
import { repeat } from 'lit/directives/repeat.js';
import { Slice } from '@milkdown/prose/model';
import { Ctx } from '@milkdown/ctx';

import { ResourceManager } from './resource-manager';
import { ClientMessage } from './client-message';
import { vscode } from './api';
import { useUploader } from './uploader';
import { useListener } from './listener';
import { VsImage } from './vs-image';

@customElement('milkdown-editor')
export class Editor extends ShallowLitElement {
    editor: Milkdown | null = null;
    resource = ResourceManager.Instance;
    message = ClientMessage.Instance;
    nodeViewFactory = useNodeViewFactory(this);

    @state()
    private outline: { text: string; level: number; id: string }[] = [];

    updateMarkdown = (markdown: string): boolean => {
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
            view.dispatch(
                state.tr
                    .setMeta('addToHistory', false)
                    .replace(0, state.doc.content.size, new Slice(doc.content, 0, 0)),
            );
            vscode.setState({ text: markdown });
            return true;
        });
    };

    override async connectedCallback() {
        await super.connectedCallback();
        window.addEventListener('message', this.handleMessage);
    }

    override disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('message', this.handleMessage);
    }

    private handleMessage = (event: MessageEvent) => {
        const message = event.data;
        switch (message.type) {
            case 'update': {
                const text = message.text;
                this.updateMarkdown(text);
                return;
            }
            case 'resource-response': {
                this.resource.resolve(message.origin, message.result);
                return;
            }
        }
    };

    private get nodeView() {
        const value = this.nodeViewFactory.value;
        if (!value) {
            throw new Error();
        }

        return value;
    }

    private onUpdate = (ctx: Ctx) => {
        requestAnimationFrame(() => {
            const data = outline()(ctx);
            this.outline = [...data];
        });
    };

    private editorRef: RefOrCallback = (element) => {
        if (!element || element.firstChild || !(element instanceof HTMLElement)) return;

        const nodeViewFactory = this.nodeView;

        Milkdown.make()
            .config((ctx) => {
                ctx.set(rootCtx, element);
                const state = vscode.getState();
                ctx.set(defaultValueCtx, state?.text ?? '');

                useUploader(ctx, this.message);
                useListener(ctx, this.message, this.onUpdate);
            })
            .use(commonmark)
            .use(gfm)
            .use(math)
            .use(history)
            .use(listener)
            .use(emoji)
            .use(clipboard)
            .use(prism)
            .use(indent)
            .use(cursor)
            .use(trailing)
            .use(upload)
            .use(
                $view(imageSchema.node, () =>
                    nodeViewFactory({
                        component: VsImage,
                    }),
                ),
            )
            .create()
            .then((editor) => {
                this.editor = editor;
            });
    };

    override render() {
        return html`
            <main class="w-[calc(100vw-300px)]">
                <div class="editor prose mx-auto" ${ref(this.editorRef)}></div>
            </main>
            <nav class="w-[270px] fixed top-0 right-0 h-full overflow-y-auto">
                <ul>
                    ${repeat(
                        this.outline,
                        (outline) => outline.id,
                        ({ text, level, id }) => {
                            const content =
                                Array(level - 1)
                                    .fill('ㅤㅤ')
                                    .join('') +
                                (level > 1 ? '↳ ' : '') +
                                text;

                            return html`<li class="py-1 overflow-hidden w-full truncate">
                                <a href=${'#' + id}>${content}</a>
                            </li>`;
                        },
                    )}
                </ul>
            </nav>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'milkdown-editor': Editor;
    }
}
