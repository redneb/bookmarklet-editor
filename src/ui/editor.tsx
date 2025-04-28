import {onCleanup, type Component} from "solid-js";

import styles from "./editor.module.css";
import {state, update_state} from "./state";
import {create_editor} from "./monaco";

function set_state_code_text(text: string) {
	update_state((state) => {
		state.code = text;
	});
}

export let set_code_text = set_state_code_text;

export const EditorPane: Component = () => {
	const editor_wrapper = <div class={styles.editor_wrapper}></div> as HTMLElement;

	// When there is an editor, we let it call set_state_code_text when the text changes, either
	// by the user's actions or programmatically via the `set_code_text` function.
	const editor = create_editor(editor_wrapper, state.code, set_state_code_text);
	set_code_text = editor.set_text;
	onCleanup(() => {
		editor.dispose();
		set_code_text = set_state_code_text;
	});

	const on_clear_click = (ev: MouseEvent) => {
		ev.preventDefault();
		editor.set_text("");
	};
	const on_editor_pane_click = (ev: MouseEvent) => {
		if (!editor_wrapper.contains(ev.target as Node) || editor_wrapper === ev.target)
			editor.focus();
	};

	return (
		<label class={styles.editor_pane} onclick={on_editor_pane_click}>
			<div>Code: (<a class={styles.clear} onclick={on_clear_click}>clear</a>)</div>
			{editor_wrapper}
		</label>
	);
};
