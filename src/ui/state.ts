import {createMemo, createRoot} from "solid-js";
import {createStore, produce} from "solid-js/store";

import {default_wrapping_mode} from "../constants";
import {encode_code} from "../util/encode";

const initial_code_text = `const msg = "Bonjour tout le monde";\nalert(msg);\n`;

export const [state, set_state] = createStore({
	code: initial_code_text,
	wrapping_mode: default_wrapping_mode,
});

export type State = typeof state;

export function update_state(updater: (state: State) => void) {
	set_state(
		produce(updater),
	);
}

export let code_encoded: () => string;
createRoot(() => {
	code_encoded = createMemo(() => encode_code(state.code, state.wrapping_mode));
});
