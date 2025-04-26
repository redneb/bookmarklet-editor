import {createSignal} from "solid-js";

export function auto_clearing_status(default_time = 1_000) {
	const [text, set_text] = createSignal("");
	let timeout = 0;

	const clear_status = () => {
		set_text("");
	};
	const set_status = (text: string, time = default_time) => {
		set_text(text);
		clearTimeout(timeout);
		timeout = setTimeout(clear_status, time);
	};

	const node = <span>{text()}</span>;
	return {
		node,
		set: set_status,
	};
}
