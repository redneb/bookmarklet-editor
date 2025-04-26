import {type WrappingMode} from "../constants";
import {unreachable} from "./unreachable";

export function encode_code(code_str: string, wrapping_mode: WrappingMode) {
	let wrapped_code_str;
	switch (wrapping_mode) {
		case "block": {
			wrapped_code_str = `{\n${code_str}\n}`;
			break;
		}
		case "function": {
			wrapped_code_str = `(function(){\n${code_str}\n})()`;
			break;
		}
		case "arrow_function": {
			wrapped_code_str = `(()=>{\n${code_str}\n})()`;
			break;
		}
		default:
			unreachable(wrapping_mode);
	}
	const url = "javascript:" + encodeURIComponent(wrapped_code_str);
	return url;
}

interface ParseResult {
	code_str: string;
	mode: WrappingMode | undefined;
	warning: string | undefined;
}

export function parse_bookmarklet_url(url: string): ParseResult {
	if (!url.startsWith("javascript:"))
		throw new Error("Not a javascript url");
	const wrapped_code_str = decodeURIComponent(url.substring("javascript:".length));
	const m1 = /^\s*\{(?:[\t ]*\n)?(.*?)(?:\n[\t ]*)?\}\s*$/s.exec(wrapped_code_str);
	const m2 = /^\s*\(\s*function\s*\(\s*\)\s*\{(?:[\t ]*\n)?(.*?)(?:\n[\t ]*)?\}\s*\)\s*\(\s*\)\s*$/s.exec(wrapped_code_str);
	const m3 = /^\s*\(\s*\(\s*\)\s*=>\s*\{(?:[\t ]*\n)?(.*?)(?:\n[\t ]*)?\}\s*\)\s*\(\s*\)\s*$/s.exec(wrapped_code_str);
	const m = m1 || m2 || m3;
	let code_str: string, warning: string | undefined;
	if (m)
		code_str = m[1]!;
	else {
		code_str = wrapped_code_str;
		warning = "Could not find wrapper function, imported raw code";
	}
	return {
		code_str,
		mode: m1 ? "block" : m2 ? "function" : m3 ? "arrow_function" : undefined,
		warning,
	};
}
