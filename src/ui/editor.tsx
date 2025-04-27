import {type Component} from "solid-js";
import {EditorView, basicSetup} from "codemirror";
import {javascript} from "@codemirror/lang-javascript";

import "./editor_codemirror.css";
import styles from "./editor.module.css";
import {update_state} from "./state";

let editor: EditorView | undefined;
let initial_code_text: string | undefined = `const msg = "Bonjour tout le monde";\nalert(msg);\n`;

function on_code_text_updated() {
	update_state((state) => {
		state.code = editor?.state.doc.toString() ?? "";
	});
}

export function set_code_text(text: string) {
	if (!editor)
		initial_code_text = text;
	else {
		initial_code_text = undefined;
		editor.update([
			editor.state.update({changes: {from: 0, to: editor.state.doc.length, insert: text}}),
		]);
	}
}

export const EditorPane: Component = () => {
	const editor_wrapper = <div class={styles.editor_wrapper}></div> as HTMLElement;

	editor = new EditorView({
		doc: initial_code_text,
		parent: editor_wrapper,
		extensions: [
			basicSetup,
			javascript(),
			EditorView.updateListener.of((view_update) => {
				if (view_update.docChanged)
					on_code_text_updated();
			}),
		],
	});
	on_code_text_updated();

	const on_clear_click = (ev: MouseEvent) => {
		ev.preventDefault();
		set_code_text("");
	};
	const on_editor_pane_click = (ev: MouseEvent) => {
		if (!editor_wrapper.contains(ev.target as Node) || editor_wrapper === ev.target)
			editor?.focus();
	};

	return (
		<label class={styles.editor_pane} onclick={on_editor_pane_click}>
			<div>Code: (<a class={styles.clear} onclick={on_clear_click}>clear</a>)</div>
			{editor_wrapper}
		</label>
	);
};
