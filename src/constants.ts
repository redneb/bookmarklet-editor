export type WrappingMode =
	| "strict_arrow_function"
	| "function"
	| "arrow_function"
	| "block"
	| "raw"

export const default_wrapping_mode: WrappingMode = "strict_arrow_function";

export interface WrappingModeInfo {
	description: string;
	url_param: string;
	/** capture group 1 is the code */
	parse_regex: RegExp;
	wrap: (code_text: string) => string;
}

export const wrapping_modes: Record<WrappingMode, WrappingModeInfo> = {
	strict_arrow_function: {
		description: "Arrow IIFE (strict mode)",
		url_param: "s",
		parse_regex: /^\s*\(\s*\(\s*\)\s*=>\s*\{\s*(?:"use strict"|'use strict');?(?:[\t ]*\n)?(.*?)(?:\n[\t ]*)?\}\s*\)\s*\(\s*\)\s*$/s,
		wrap: code_text => `(()=>{"use strict";\n${code_text}\n})()`,
	},
	function: {
		description: "IIFE (for older browsers)",
		url_param: "f",
		parse_regex: /^\s*\(\s*function\s*\(\s*\)\s*\{(?:[\t ]*\n)?(.*?)(?:\n[\t ]*)?\}\s*\)\s*\(\s*\)\s*$/s,
		wrap: code_text => `(function(){\n${code_text}\n})()`,
	},
	arrow_function: {
		description: "Arrow IIFE",
		url_param: "a",
		parse_regex: /^\s*\(\s*\(\s*\)\s*=>\s*\{(?:[\t ]*\n)?(.*?)(?:\n[\t ]*)?\}\s*\)\s*\(\s*\)\s*$/s,
		wrap: code_text => `(()=>{\n${code_text}\n})()`,
	},
	block: {
		description: "Block",
		url_param: "b",
		parse_regex: /^\s*\{(?:[\t ]*\n)?(.*?)(?:\n[\t ]*)?\}\s*$/s,
		wrap: code_text => `{\n${code_text}\n}`,
	},
	raw: {
		description: "No wrapping, raw code",
		url_param: "r",
		parse_regex: /^(.*)$/s,
		wrap: code_text => code_text,
	},
};
