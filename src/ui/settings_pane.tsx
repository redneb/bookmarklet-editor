import {For, type Component, type JSX} from "solid-js";

import styles from "./row.module.css";
import {code_encoded, state, update_state} from "./state";
import {wrapping_modes, type WrappingMode} from "../constants";
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
					<For each={Object.entries(wrapping_modes)}>
						{([mode, info]) => <option value={mode}>{info.description}</option>}
					</For>
				</select>
			</label>
			<a href={code_encoded()} onClick={on_link_click}>bookmarklet</a>
			<span class={styles.gap} />
			<BookmarkletSize />
		</div>
	);
};
