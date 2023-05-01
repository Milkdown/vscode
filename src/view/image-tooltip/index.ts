/* Copyright 2021, Milkdown by Mirone.*/

import { tooltipFactory, TooltipProvider } from '@milkdown/plugin-tooltip';
import { Editor } from '@milkdown/core';
import { PluginViewFactory, ShallowLitElement, usePluginViewContext } from '@prosemirror-adapter/lit';
import { NodeSelection } from '@milkdown/prose/state';
import { ref, RefOrCallback } from 'lit/directives/ref.js';
import { html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { roundArrow } from 'tippy.js';
import { imageSchema } from '@milkdown/preset-commonmark';

const imageTooltip = tooltipFactory('image');

@customElement('milkdown-image-tooltip')
class ImageTooltip extends ShallowLitElement {
    provider: TooltipProvider | null = null;
    pluginViewContext = usePluginViewContext(this);

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
            },
            shouldShow: (view) => {
                const { selection } = view.state;
                const { empty, from } = selection;

                const isTooltipChildren = this.provider?.element.contains(document.activeElement);

                const notHasFocus = !view.hasFocus() && !isTooltipChildren;

                const isReadonly = !view.editable;

                if (notHasFocus || empty || isReadonly) {
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

    override render() {
        return html`
            <div class="hidden">
                <div ${ref(this.ref)}>
                    <div>tooltip | ${this.src || nothing}</div>
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
