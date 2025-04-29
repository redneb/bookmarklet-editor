import {createSignal} from "solid-js";

type Level = "success" | "error";

const level_colors: Record<Level, string> = {
	success: "green",
	error: "red",
};

const default_time: Record<Level, number> = {
	success: 1_000,
	error: 3_000,
};

export function auto_clearing_status() {
	const [status, set_status] = createSignal<{text: string, level: Level}>();
	let timeout = 0;

	const clear_status = () => {
		set_status(undefined);
	};
	const set = (level: Level, text: string, time = default_time[level]) => {
		set_status({text, level});
		clearTimeout(timeout);
		timeout = setTimeout(clear_status, time);
	};

	const node = (
		<span style={{color: status() ? level_colors[status()!.level] : undefined}}>
			{status()?.text}
		</span>
	);
	return {node, set};
}
