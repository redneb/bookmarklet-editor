import {createMemo, type Component} from "solid-js";

import {pretty_filesize} from "../util/filesize";
import {code_encoded} from "./state";

interface SizeInfo {
	size: number;
	color: string;
	message: string;
}

const size_thresholds: SizeInfo[] = [
	{size: 1024 * 1024, color: "red", message: "Too large - may fail in browsers"},
	{size: 1024 * 64, color: "orange", message: "Large - may have issues in Safari"},
	{size: 0, color: "green", message: "Good size - no issues expected"},
];

export const BookmarkletSize: Component = () => {
	const size_info = createMemo(() => {
		const size = code_encoded().length;
		for (const info of size_thresholds) {
			if (size >= info.size)
				return info;
		}
		return size_thresholds[size_thresholds.length - 1]!;
	});

	return (
		<span
			title={`Size of the bookmarklet\n${size_info().message}`}
			style={{color: size_info().color}}
		>
			{pretty_filesize(code_encoded().length)}
		</span>
	);
};
