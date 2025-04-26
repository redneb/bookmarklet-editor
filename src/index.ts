import {EditorView, basicSetup} from "codemirror";
import {javascript} from "@codemirror/lang-javascript";
import "./index.css";

const paste = document.querySelector<HTMLButtonElement>(".paste")!;
const paste_status = document.querySelector<HTMLSpanElement>(".paste_status")!;
const clear = document.querySelector<HTMLAnchorElement>(".clear")!;
const editor_wrapper = document.querySelector<HTMLDivElement>(".editor_wrapper")!;
const wrapping_mode = document.querySelector<HTMLSelectElement>(".wrapping_mode")!;
const link_name = document.querySelector<HTMLInputElement>(".link_name")!;
const link = document.querySelector<HTMLAnchorElement>(".link")!;
const copy = document.querySelector<HTMLButtonElement>(".copy")!;
const copy_status = document.querySelector<HTMLSpanElement>(".copy_status")!;

function encode_code(code_str: string) {
	let wrapped_code_str;
	switch (wrapping_mode.value) {
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
			throw new Error("Invalid wrapping mode");
	}
	const url = "javascript:" + encodeURIComponent(wrapped_code_str);
	return url;
}

function decode_code(url: string) {
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

const editor = new EditorView({
	extensions: [
		basicSetup,
		javascript(),
		EditorView.updateListener.of((view_update) => {
			if (view_update.docChanged)
				on_code_str_updated();
		}),
	],
	parent: editor_wrapper!,
});

function set_code(str: string) {
	editor.update([
		editor.state.update({changes: {from: 0, to: editor.state.doc.length, insert: str}}),
	]);
}

function get_code() {
	return editor.state.doc.toString();
}

function get_code_encoded() {
	return encode_code(get_code());
}

clear.addEventListener("click", (ev) => {
	ev.preventDefault();
	set_code("");
});

const read_clipboard =
	navigator.clipboard?.readText
		? () => navigator.clipboard.readText()
		: () => Promise.resolve(prompt("Please paste the bookmarklet URL"));
let paste_timeout = 0;
paste.addEventListener("click", () => {
	read_clipboard().then((url) => {
		if (url === null) return;
		clearTimeout(paste_timeout);
		paste_status.textContent = "";
		const {code_str, warning, mode} = decode_code(url);
		if (mode)
			wrapping_mode.value = mode;
		if (warning)
			paste_status.textContent = warning;
		else {
			paste_status.textContent = "Success!";
			paste_timeout = setTimeout(() => {
				paste_status.textContent = "";
			}, 1_000);
		}
		set_code(code_str);
	}).catch((err) => {
		console.error(err);
		paste_status.textContent = `Failed (${err.message})`;
	});
});

let copy_timeout = 0;
copy.addEventListener("click", () => {
	if (!navigator.clipboard?.writeText) {
		alert("Use the bookmarklet link to copy the bookmarklet URL to your clipboard");
		return;
	}
	const url = get_code_encoded();
	navigator.clipboard.writeText(url).then(() => {
		clearTimeout(copy_timeout);
		copy_timeout = setTimeout(() => {
			copy_status.textContent = "";
		}, 1_000);
		copy_status.textContent = "Success!";
	}).catch((err) => {
		console.error(err);
		copy_status.textContent = `Failed (${err.message})`;
	});
});

link_name.addEventListener("input", () => {
	link.textContent = link_name.value;
});
function on_code_str_updated() {
	link.href = get_code_encoded();
}
wrapping_mode.addEventListener("input", () => {
	on_code_str_updated();
});
link.addEventListener("click", (ev) => {
	if (!confirm("Execute bookmarklet?"))
		ev.preventDefault();
});
document.querySelector(".editor_pane")!.addEventListener("click", (ev) => {
	if (!editor_wrapper.contains(ev.target as Node) || editor_wrapper === ev.target)
		editor.focus();
});

link_name.dispatchEvent(new Event("input"));
set_code(`const msg = "Bonjour tout le monde";\nalert(msg);\n`);
document.body.classList.remove("loading");
