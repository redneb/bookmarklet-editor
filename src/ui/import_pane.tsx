import {createSignal, type Component} from "solid-js";

import styles from "./row.module.css";
import {read_clipboard} from "../util/read_clipboard";
import {parse_bookmarklet_url} from "../util/encode";
import {update_state} from "./state";
import {auto_clearing_status} from "./auto_clearing_status";
import {set_code_text} from "./editor";

export const ImportPane: Component = () => {
	const status = auto_clearing_status();
	const [force_raw, set_force_raw] = createSignal(false);

	const on_paste_click = async() => {
		try {
			const bookmarklet_url = await read_clipboard();
			if (bookmarklet_url === null) return;
			const parsed = parse_bookmarklet_url(bookmarklet_url, force_raw());
			status.set("success", parsed.warning ?? "Success!");
			update_state((state) => {
				state.wrapping_mode = parsed.mode;
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
			<label
				class={styles.gapless_row}
				title="Do not attempt to detect the wrapping mode, just import the raw code."
			>
				<input type="checkbox" checked={force_raw()} onchange={() => set_force_raw(!force_raw())} />
				Always import as raw
			</label>
			{status.node}
			<span class={styles.gap} />
			<a target="_blank" href="https://github.com/redneb/bookmarklet-editor/">GitHub</a>
			<a target="_blank" href="https://github.com/redneb/bookmarklet-editor/blob/main/README.md">Help</a>
		</div>
	);
};
