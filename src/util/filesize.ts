const unit_prefixes = ["", "K", "M", "G", "T", "P", "E", "Z"];
const unit_prefixes_max_idx = unit_prefixes.length - 1;

function get_precision_for_size(size: number) {
	return size < 10 ? 2 : size < 100 ? 1 : 0;
}

function round(x: number, precision: number) {
	const factor = 10 ** precision;
	return Math.round(x * factor) / factor;
}

export interface PrettyFilesizeOptions {
	/** Support fractional byte sizes, e.g. for rates */
	fractional?: boolean;
	/** Use decimal units, so that e.g. 1 MB = 1000 KB */
	decimal?: boolean;
}

const default_options: Required<PrettyFilesizeOptions> = {
	fractional: false,
	decimal: false,
};

export function pretty_filesize(size: number | bigint, options: PrettyFilesizeOptions = {}): string {
	const opts: Required<PrettyFilesizeOptions> = {...default_options, ...options};
	const base = opts.decimal ? 1000 : 1024;
	size = Number(size);
	if (size < base && !opts.fractional)
		return `${size | 0} B`;
	else {
		let unit_idx = 0;
		while (size >= base && unit_idx < unit_prefixes_max_idx) {
			size /= base;
			unit_idx++;
		}
		let precision = get_precision_for_size(size);
		let size_rounded = round(size, precision);
		const precision_after_rounding = get_precision_for_size(size_rounded);
		if (precision !== precision_after_rounding) {
			precision = precision_after_rounding;
			size_rounded = round(size, precision);
		}
		if (opts.decimal && size_rounded >= base && unit_idx < unit_prefixes_max_idx) {
			size /= base;
			unit_idx++;
			precision = get_precision_for_size(size);
			size_rounded = round(size, precision);
		}
		const unit_prefix = unit_prefixes[unit_idx]!;
		const unit_infix = !unit_prefix || opts.decimal ? "" : "i";
		return `${size_rounded.toFixed(precision)} ${unit_prefix}${unit_infix}B`;
	}
}
