/* Copyright 2021, Milkdown by Mirone.*/

import { tooltipFactory, TooltipProvider } from '@milkdown/plugin-tooltip';
import { Editor } from '@milkdown/core';
import { PluginViewFactory, ShallowLitElement, usePluginViewContext } from '@prosemirror-adapter/lit';
import { NodeSelection } from '@milkdown/prose/state';
import { ref, RefOrCallback } from 'lit/directives/ref.js';
import { html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { roundArrow } from 'tippy.js';
import { imageSchema } from '@milkdown/preset-commonmark';
import clsx from 'clsx';

const imageTooltip = tooltipFactory('image');

@customElement('milkdown-image-tooltip')
class ImageTooltip extends ShallowLitElement {
    provider: TooltipProvider | null = null;
    pluginViewContext = usePluginViewContext(this);

    @state()
    protected tab: 'link' | 'title' = 'link';

    get context() {
        const ctx = this.pluginViewContext.value;
        if (!ctx) {
            throw new Error();
        }

        return ctx;
    }

    get node() {
        const { state } = this.context.view;
        const { selection } = state;

        return state.doc.nodeAt(selection.from);
    }

    get attrs(): { src?: string; alt?: string; title?: string } {
        return this.node?.attrs ?? {};
    }

    get src() {
        return this.attrs?.src;
    }

    get alt() {
        return this.attrs?.alt;
    }

    get displayTitle() {
        return this.attrs?.title;
    }

    private ref: RefOrCallback = (element) => {
        if (!element || !(element instanceof HTMLElement)) return;
        this.provider ??= new TooltipProvider({
            content: element,
            debounce: 20,
            tippyOptions: {
                theme: 'vsc',
                arrow: roundArrow,
                appendTo: () => {
                    return this.renderRoot as HTMLElement;
                },
                onHide: () => {
                    this.tab = 'link';
                },
            },
            shouldShow: (view) => {
                const { selection } = view.state;
                const { empty, from } = selection;

                const isReadonly = !view.editable;

                if (empty || isReadonly) {
                    return false;
                }

                return selection instanceof NodeSelection && view.state.doc.nodeAt(from)?.type === imageSchema.type();
            },
        });
    };

    override updated() {
        const { view, prevState } = this.context;
        this.provider?.update(view, prevState);
    }

    protected onLinkTab(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        this.tab = 'link';
    }

    protected onTitleTab(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        this.tab = 'title';
    }

    protected onConfirm(e: Event) {
        const input = this.renderRoot.querySelector('input');
        if (!input) return;

        e.preventDefault();
        e.stopPropagation();

        const value = input.value ?? null;
        const attr = this.tab === 'link' ? 'src' : 'title';
        const { view } = this.context;
        const { state, dispatch } = view;

        const { selection } = state;
        let { tr } = state;

        tr = tr.setNodeMarkup(selection.from, undefined, { ...this.attrs, [attr]: value });
        tr = tr.setSelection(NodeSelection.create(tr.doc, selection.from));

        dispatch(tr);
    }

    protected keyboardConfirm(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            this.onConfirm(e);
        }
    }

    override render() {
        const buttonClass = 'rounded-t py-1 px-2 cursor-pointer';
        const activeButtonClass = 'bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)]';
        const inactiveButtonClass = 'hover:bg-[var(--vscode-editor-background)]';
        return html`
            <div class="hidden">
                <div ${ref(this.ref)}>
                    <div>
                        <div class="flex divide-x divide-[var(--vscode-button-separator)]">
                            <div
                                class="${clsx(
                                    buttonClass,
                                    this.tab === 'link' ? activeButtonClass : inactiveButtonClass,
                                )}"
                                @mousedown=${this.onLinkTab}
                            >
                                Link
                            </div>
                            <div
                                class="${clsx(
                                    buttonClass,
                                    this.tab === 'title' ? activeButtonClass : inactiveButtonClass,
                                )}"
                                @mousedown=${this.onTitleTab}
                            >
                                Title
                            </div>
                        </div>
                        <div
                            class="flex bg-[var(--vscode-editor-background)] border rounded-b border-[var(--vscode-button-background)] py-1 px-2"
                        >
                            ${this.tab === 'link'
                                ? html`<input
                                      class="bg-inherit !text-xs w-52"
                                      type="text"
                                      .value=${this.src ?? ''}
                                      @keydown=${this.keyboardConfirm}
                                      placeholder="Image URL"
                                  />`
                                : html`<input
                                      class="bg-inherit !text-xs w-52"
                                      type="text"
                                      .value=${this.displayTitle ?? ''}
                                      @keydown=${this.keyboardConfirm}
                                      placeholder="Image Title"
                                  />`}
                            <div
                                class="cursor-pointer rounded-full transition-colors hover:bg-[var(--vscode-notifications-background)] p-1"
                                @mousedown=${this.onConfirm}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    class="w-5 h-5"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'milkdown-image-tooltip': ImageTooltip;
    }
}

export const useImageTooltip = (editor: Editor, pluginViewFactory: PluginViewFactory) => {
    editor.config((ctx) => {
        ctx.set(imageTooltip.key, {
            view: pluginViewFactory({
                component: ImageTooltip,
            }),
        });
    });
    editor.use(imageTooltip);
};
