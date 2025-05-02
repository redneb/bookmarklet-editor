import {wrapping_modes, type WrappingMode} from "../constants";
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

const code_text_prefix = "a";

async function encode_code_text(code_text: string) {
	const code_text_compressed = await compress_string(code_text);
	return code_text_prefix + base64url_encode(code_text_compressed);
}

async function decode_code_text(param_value: string) {
	if (!param_value.startsWith(code_text_prefix))
		throw new Error("Invalid parameter value for code text");
	const code_text_compressed = base64url_decode(param_value.slice(code_text_prefix.length));
	return decompress_string(code_text_compressed);
}

export interface UrlParams {
	code_text: string;
	wrapping_mode: WrappingMode;
}

export async function encode_url_params(params: UrlParams) {
	const c_param = await encode_code_text(params.code_text);
	const w_param = wrapping_modes[params.wrapping_mode].url_param;
	const search_params = new URLSearchParams([
		["c", c_param],
		["w", w_param],
	]);
	return `#${search_params.toString()}`;
}

const url_param_to_wrapping_mode = new Map(
	Object.entries(wrapping_modes).map(([mode, info]) => [info.url_param, mode as WrappingMode]),
);

export async function decode_url_params(hash: string): Promise<Partial<UrlParams>> {
	const search_params = new URLSearchParams(hash.replace(/^#/, ""));
	let code_text: string | undefined;
	const c_param = search_params.get("c");
	if (c_param)
		code_text = await decode_code_text(c_param);
	let wrapping_mode: WrappingMode | undefined;
	const w_param = search_params.get("w");
	if (w_param)
		wrapping_mode = url_param_to_wrapping_mode.get(w_param);
	return {
		code_text,
		wrapping_mode,
	};
}
