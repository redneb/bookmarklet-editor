import {type Component} from "solid-js";

import {code_encoded} from "./state";
import {auto_clearing_status} from "./auto_clearing_status";

export const ExportPane: Component = () => {
	const status = auto_clearing_status();

	const on_copy_click = async () => {
		if (!navigator.clipboard?.writeText) {
			alert("Use the bookmarklet link to copy the bookmarklet URL to your clipboard");
			return;
		}
		const url = code_encoded();
		try {
			await navigator.clipboard.writeText(url);
			status.set("Success!");
		}
		catch (err) {
			console.error(err);
			status.set(`Failed (${err instanceof Error ? err.message : "Unknown error"})`);
		}
	};

	return (
		<div>
			<button onclick={on_copy_click}>Export to clipboard (copy)</button>
			{status.node}
		</div>
	);
};
