import {unreachable} from "../util/unreachable";
import {encode_url_params, type UrlParams} from "../util/url_params";

const interval_ms = 100;

type UpdaterState =
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

let updater_state: UpdaterState = {
	status: "idle",
};

async function perform_update() {
	if (updater_state.status !== "scheduled") {
		console.error("perform_update: invalid state", updater_state);
		return;
	}
	const params = updater_state.params;
	updater_state = {status: "updating"};
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
	const next_params = updater_state.next_params;
	updater_state = {status: "idle"};
	if (next_params !== undefined)
		schedule_url_update(next_params, false);
}

export function schedule_url_update(params: UrlParams, immediate: boolean) {
	switch (updater_state.status) {
		case "idle":
			updater_state = {
				status: "scheduled",
				params,
				timeout: setTimeout(perform_update, immediate ? 0 : interval_ms),
			};
			break;
		case "scheduled":
			updater_state.params = params;
			break;
		case "updating":
			updater_state.next_params = params;
			break;
		default:
			unreachable(updater_state);
	}
}
