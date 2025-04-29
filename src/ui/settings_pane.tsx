import {type Component, type JSX} from "solid-js";

import styles from "./row.module.css";
import {code_encoded, state, update_state} from "./state";
import {type WrappingMode} from "../constants";
import {BookmarkletSize} from "./bookmarklet_size";

export const SettingsPane: Component = () => {
	const on_wrapping_mode_change: JSX.ChangeEventHandler<HTMLSelectElement, Event> = (ev) => {
		update_state((state) => {
			state.wrapping_mode = ev.target.value as WrappingMode;
		});
	};
	const on_link_click: JSX.EventHandler<HTMLAnchorElement, MouseEvent> = (ev) => {
		if (!confirm("Execute bookmarklet?"))
			ev.preventDefault();
	};

	return (
		<div class={styles.row}>
			<label class={styles.row}>
				Code wrapper:
				<select value={state.wrapping_mode} onchange={on_wrapping_mode_change}>
					<option value="block">Block (recommended)</option>
					<option value="function">Function (for older browsers)</option>
					<option value="arrow_function">Arrow function</option>
				</select>
			</label>
			<a href={code_encoded()} onClick={on_link_click}>bookmarklet</a>
			<span class={styles.gap} />
			<BookmarkletSize />
		</div>
	);
};
