import {unreachable} from "../util/unreachable";
import {encode_url_params, type UrlParams} from "../util/url_params";

const interval_ms = 100;

type State =
	| {
		status: "idle";
	}
	| {
		status: "scheduled";
		timeout: number;
		params: UrlParams;
	}
	| {
		status: "updating";
		/** If set, it indicates that another update request arrived while the previous update was in progress. */
		next_params?: UrlParams;
	};

let state: State = {
	status: "idle",
};

async function perform_update() {
	if (state.status !== "scheduled") {
		console.error("perform_update: invalid state", state);
		return;
	}
	const params = state.params;
	state = {status: "updating"};
	const url = new URL(location.href);
	let new_hash: string;
	if (params === undefined)
		new_hash = "";
	else
		new_hash = await encode_url_params(params);
	if (url.hash !== new_hash) {
		url.hash = new_hash;
		history.replaceState(null, "", url.href);
	}
	if (state.next_params !== undefined)
		schedule_url_update(state.next_params, false);
	else
		state = {status: "idle"};
}

export function schedule_url_update(params: UrlParams, immediate: boolean) {
	switch (state.status) {
		case "idle":
			state = {
				status: "scheduled",
				params,
				timeout: setTimeout(perform_update, immediate ? 0 : interval_ms),
			};
			break;
		case "scheduled":
			state.params = params;
			break;
		case "updating":
			state.next_params = params;
			break;
		default:
			unreachable(state);
	}
}
