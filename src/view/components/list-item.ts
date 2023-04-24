/* Copyright 2021, Milkdown by Mirone.*/

import { customElement } from 'lit/decorators.js';
import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';
import clsx from 'clsx';

import { LitNodeView } from '../utils/lit-node-view';

@customElement('milkdown-list-item')
export class ListItem extends LitNodeView {
    get type() {
        return this.node.attrs.listType;
    }

    get label() {
        return this.node.attrs.label;
    }

    override render() {
        const { contentRef, selected } = this.ctx;

        return html`<li class=${clsx('flex flex-colum items-start gap-2', selected && 'ProseMirror-selectednode')}>
            <span>${this.label}</span>
            <div class="min-w-0" ${ref(contentRef)}></div>
        </li>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'milkdown-list-item': ListItem;
    }
}
