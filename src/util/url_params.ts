import {type WrappingMode} from "../constants";
import {compress_string, decompress_string} from "./compress";

const chunk_size = 64 * 1024;

function latin1_decode(data: Uint8Array) {
	const chunks: string[] = [];
	const length = data.length;
	for (let offset = 0; offset < length; offset += chunk_size) {
		const data_chunk = data.subarray(offset, offset + chunk_size);
		chunks.push(String.fromCharCode(...data_chunk));
	}
	return chunks.join("");
}

function latin1_encode(string: string) {
	return Uint8Array.from(string.split("").map(c => c.charCodeAt(0)));
	// return Uint8Array.from({length: string.length}, (_, i) => string.charCodeAt(i));
	// return Uint8Array.from(string.split(""), c => c.charCodeAt(0));
}

function base64url_encode(data: Uint8Array) {
	const base64_string = btoa(latin1_decode(data));
	return base64_string.replace(/={0,2}$/, "").replaceAll("+", "-").replaceAll("/", "_");
}

function base64url_decode(string: string) {
	const base64_string = string.replaceAll("-", "+").replaceAll("_", "/");
	return latin1_encode(atob(base64_string));
}

export interface UrlParams {
	code_text: string;
	wrapping_mode: WrappingMode;
}

export async function encode_url_params(params: UrlParams) {
	const code_text_compressed = await compress_string(params.code_text);
	let w_param: string;
	switch (params.wrapping_mode) {
		case "block":
			w_param = "b";
			break;
		case "function":
			w_param = "f";
			break;
		case "arrow_function":
			w_param = "a";
			break;
	}
	const search_params = new URLSearchParams([
		["c", base64url_encode(code_text_compressed)],
		["w", w_param],
	]);
	return `#${search_params.toString()}`;
}

export async function decode_url_params(hash: string): Promise<Partial<UrlParams>> {
	const search_params = new URLSearchParams(hash.replace(/^#/, ""));
	let code_text: string | undefined;
	const c_param = search_params.get("c");
	if (c_param) {
		const code_text_compressed = base64url_decode(c_param);
		code_text = await decompress_string(code_text_compressed);
	}
	let wrapping_mode: WrappingMode | undefined;
	switch (search_params.get("w")) {
		case "b":
			wrapping_mode = "block";
			break;
		case "f":
			wrapping_mode = "function";
			break;
		case "a":
			wrapping_mode = "arrow_function";
			break;
	}
	return {
		code_text,
		wrapping_mode,
	};
}
