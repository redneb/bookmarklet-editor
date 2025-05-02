import {wrapping_modes, type WrappingMode} from "../constants";

export function encode_code(code_str: string, wrapping_mode: WrappingMode) {
	const wrapped_code_str = wrapping_modes[wrapping_mode].wrap(code_str);
	const url = "javascript:" + encodeURIComponent(wrapped_code_str);
	return url;
}

interface ParseResult {
	code_str: string;
	mode: WrappingMode | undefined;
	warning?: string;
}

export function parse_bookmarklet_url(url: string): ParseResult {
	if (!url.startsWith("javascript:"))
		throw new Error("Not a javascript url");
	const wrapped_code_str = decodeURIComponent(url.substring("javascript:".length));
	for (const [mode, info] of Object.entries(wrapping_modes)) {
		const m = info.parse_regex.exec(wrapped_code_str);
		if (m) {
			return {
				code_str: m[1]!,
				mode: mode as WrappingMode,
			};
		}
	}
	return {
		code_str: wrapped_code_str,
		mode: undefined,
		warning: "Could not find wrapper function, imported raw code",
	};
}
