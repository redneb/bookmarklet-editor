import {type Component} from "solid-js";

import styles from "./row.module.css";
import {default_wrapping_mode} from "../constants";
import {read_clipboard} from "../util/read_clipboard";
import {parse_bookmarklet_url} from "../util/encode";
import {update_state} from "./state";
import {auto_clearing_status} from "./auto_clearing_status";
import {set_code_text} from "./editor";

export const ImportPane: Component = () => {
	const status = auto_clearing_status();

	const on_paste_click = async() => {
		try {
			const bookmarklet_url = await read_clipboard();
			if (bookmarklet_url === null) return;
			const parsed = parse_bookmarklet_url(bookmarklet_url);
			status.set("success", parsed.warning ?? "Success!");
			update_state((state) => {
				state.wrapping_mode = parsed.mode ?? default_wrapping_mode;
			});
			set_code_text(parsed.code_str);
		}
		catch (err) {
			console.error(err);
			status.set("error", `${err instanceof Error ? err.message : `${err}`}`);
		}
	};

	return (
		<div class={styles.row}>
			<button onclick={on_paste_click}>Import from clipboard</button>
			{status.node}
			<span class={styles.gap} />
			<a target="_blank" href="https://github.com/redneb/bookmarklet-editor/">GitHub</a>
			<a target="_blank" href="https://github.com/redneb/bookmarklet-editor/blob/main/README.md">Help</a>
		</div>
	);
};
