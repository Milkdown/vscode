/* Copyright 2021, Milkdown by Mirone.*/

import { ShallowLitElement, useNodeViewContext } from '@prosemirror-adapter/lit';
import { ResourceManager } from './resource-manager';
import { ClientMessage } from './client-message';

export class LitNodeView extends ShallowLitElement {
    nodeViewContext = useNodeViewContext(this);
    resource = ResourceManager.Instance;
    message = ClientMessage.Instance;

    get ctx() {
        const ctx = this.nodeViewContext.value;
        if (!ctx) {
            throw new Error();
        }
        return ctx;
    }

    get node() {
        const { node } = this.ctx;
        return node;
    }

    get getPos() {
        const { getPos } = this.ctx;
        return getPos;
    }

    get view() {
        const { view } = this.ctx;
        return view;
    }

    get attrs() {
        const { attrs } = this.node;
        return attrs;
    }
}
