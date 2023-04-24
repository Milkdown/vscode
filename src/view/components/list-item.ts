/* Copyright 2021, Milkdown by Mirone.*/

import { customElement } from 'lit/decorators.js';
import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';
import clsx from 'clsx';

import { LitNodeView } from '../utils/lit-node-view';

@customElement('milkdown-list-item')
export class ListItem extends LitNodeView {
    private onChange() {
        const { checked } = this.node.attrs;
        this.ctx.setAttrs({ checked: !checked });
    }

    override render() {
        const { contentRef, selected } = this.ctx;

        if (this.attrs.checked == null) {
            return html`<li class=${clsx('flex flex-colum items-start gap-2', selected && 'ProseMirror-selectednode')}>
                ${html`<span>${this.attrs.listType === 'bullet' ? '⦿' : this.attrs.label}</span>`}
                <div class="min-w-0 flex-1" ${ref(contentRef)}></div>
            </li>`;
        }

        return html`<li class=${clsx('flex flex-colum items-start gap-2', selected && 'ProseMirror-selectednode')}>
            <input type="checkbox" class="h-6" ?checked=${this.attrs.checked} @change="${this.onChange}" />
            <div class="min-w-0 flex-1" ${ref(contentRef)}></div>
        </li>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'milkdown-list-item': ListItem;
    }
}
