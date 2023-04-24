/* Copyright 2021, Milkdown by Mirone.*/

import { ShallowLitElement, useNodeViewContext } from '@prosemirror-adapter/lit';
import { ResourceManager } from './resource-manager';
import { ClientMessage } from './client-message';

export class LitNodeView extends ShallowLitElement {
    nodeViewContext = useNodeViewContext(this);
    resource = ResourceManager.Instance;
    message = ClientMessage.Instance;

    protected get ctx() {
        const ctx = this.nodeViewContext.value;
        if (!ctx) {
            throw new Error();
        }
        return ctx;
    }

    protected get node() {
        const { node } = this.ctx;
        return node;
    }

    protected get attrs() {
        const { attrs } = this.node;
        return attrs;
    }
}
