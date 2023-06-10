/* Copyright 2021, Milkdown by Mirone.*/
import {
    EditorView as CodeMirror,
    KeyBinding,
    keymap as cmKeymap,
    ViewUpdate,
    lineNumbers,
    gutter,
} from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { defaultKeymap } from '@codemirror/commands';
import { Selection, TextSelection } from '@milkdown/prose/state';
import { Line, SelectionRange } from '@codemirror/state';
import { Node } from '@milkdown/prose/model';
import { exitCode } from '@milkdown/prose/commands';
import { redo, undo } from '@milkdown/prose/history';
import { EditorView, NodeView } from '@milkdown/prose/view';
import { nord } from './nord';

const cmExtensions = [nord, javascript(), lineNumbers(), gutter({ class: 'cm-gutter' })];

export class CodeBlock implements NodeView {
    dom: HTMLElement;
    cm: CodeMirror;

    updating = false;

    constructor(public node: Node, public view: EditorView, public getPos: () => number | undefined) {
        this.cm = new CodeMirror({
            doc: this.node.textContent,
            extensions: [
                ...cmExtensions,
                cmKeymap.of([...this.codeMirrorKeymap(), ...defaultKeymap]),
                CodeMirror.updateListener.of((update) => this.forwardUpdate(update)),
            ],
        });
        this.dom = this.cm.dom;
    }

    private codeMirrorKeymap = (): KeyBinding[] => {
        const view = this.view;
        return [
            { key: 'ArrowUp', run: () => this.maybeEscape('line', -1) },
            { key: 'ArrowLeft', run: () => this.maybeEscape('char', -1) },
            { key: 'ArrowDown', run: () => this.maybeEscape('line', 1) },
            { key: 'ArrowRight', run: () => this.maybeEscape('char', 1) },
            {
                key: 'Ctrl-Enter',
                run: () => {
                    if (!exitCode(view.state, view.dispatch)) return false;
                    view.focus();
                    return true;
                },
            },
            { key: 'Ctrl-z', mac: 'Cmd-z', run: () => undo(view.state, view.dispatch) },
            { key: 'Shift-Ctrl-z', mac: 'Shift-Cmd-z', run: () => redo(view.state, view.dispatch) },
            { key: 'Ctrl-y', mac: 'Cmd-y', run: () => redo(view.state, view.dispatch) },
        ];
    };

    private maybeEscape = (unit: 'line' | 'char', dir: -1 | 1): boolean => {
        const { state } = this.cm;
        let main: SelectionRange | Line = state.selection.main;
        if (!main.empty) return false;
        if (unit == 'line') main = state.doc.lineAt(main.head);
        if (dir < 0 ? main.from > 0 : main.to < state.doc.length) return false;

        const targetPos = (this.getPos() ?? 0) + (dir < 0 ? 0 : this.node.nodeSize);
        const selection = Selection.near(this.view.state.doc.resolve(targetPos), dir);
        const tr = this.view.state.tr.setSelection(selection).scrollIntoView();
        this.view.dispatch(tr);
        this.view.focus();
        return true;
    };

    private forwardUpdate(update: ViewUpdate) {
        if (this.updating || !this.cm.hasFocus) return;
        const { main } = update.state.selection;
        let offset = (this.getPos() ?? 0) + 1;
        const selFrom = offset + main.from,
            selTo = offset + main.to;
        const pmSel = this.view.state.selection;
        if (update.docChanged || pmSel.from != selFrom || pmSel.to != selTo) {
            const tr = this.view.state.tr;
            update.changes.iterChanges((fromA, toA, fromB, toB, text) => {
                if (text.length)
                    tr.replaceWith(offset + fromA, offset + toA, this.view.state.schema.text(text.toString()));
                else tr.delete(offset + fromA, offset + toA);
                offset += toB - fromB - (toA - fromA);
            });
            tr.setSelection(TextSelection.create(tr.doc, selFrom, selTo));
            this.view.dispatch(tr);
        }
    }

    setSelection(anchor: number, head: number) {
        this.cm.focus();
        this.updating = true;
        this.cm.dispatch({ selection: { anchor, head } });
        this.updating = false;
    }

    update(node: Node) {
        if (node.type != this.node.type) return false;
        this.node = node;
        if (this.updating) return true;
        const newText = node.textContent,
            curText = this.cm.state.doc.toString();
        if (newText != curText) {
            let start = 0,
                curEnd = curText.length,
                newEnd = newText.length;
            while (start < curEnd && curText.charCodeAt(start) == newText.charCodeAt(start)) {
                ++start;
            }
            while (
                curEnd > start &&
                newEnd > start &&
                curText.charCodeAt(curEnd - 1) == newText.charCodeAt(newEnd - 1)
            ) {
                curEnd--;
                newEnd--;
            }
            this.updating = true;
            this.cm.dispatch({
                changes: {
                    from: start,
                    to: curEnd,
                    insert: newText.slice(start, newEnd),
                },
            });
            this.updating = false;
        }
        return true;
    }

    selectNode() {
        this.cm.focus();
    }

    stopEvent() {
        return true;
    }
}
