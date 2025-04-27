import {createEffect, createSignal, onMount, Show, type Component} from "solid-js";

import {decode_url_params} from "../util/url_params";
import {state, update_state} from "./state";
import {schedule_url_update} from "./update_url_params";
import {ImportPane} from "./import_pane";
import {EditorPane, set_code_text} from "./editor";
import {SettingsPane} from "./settings_pane";
import {ExportPane} from "./export_pane";

export const App: Component = () => {
	const [ready, set_ready] = createSignal(false);
	onMount(async () => {
		try {
			const {code_text, wrapping_mode} = await decode_url_params(location.hash);
			if (code_text !== undefined)
				set_code_text(code_text);
			if (wrapping_mode !== undefined) {
				update_state((state) => {
					state.wrapping_mode = wrapping_mode;
				});
			}
		}
		catch (error) {
			console.error(error);
		}
		document.body.classList.remove("loading");
		set_ready(true);
	});
	let is_first = true;
	createEffect(() => {
		if (!ready())
			return;
		schedule_url_update({
			code_text: state.code,
			wrapping_mode: state.wrapping_mode,
		}, is_first);
		is_first = false;
	});

	return (
		<Show when={ready()}>
			<ImportPane />
			<EditorPane />
			<SettingsPane />
			<ExportPane />
		</Show>
	);
};
