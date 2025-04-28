import * as monaco from 'monaco-editor';
import MonacoEditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import MonacoTsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

const global_editor_options: monaco.editor.IGlobalEditorOptions = {
	insertSpaces: false,
};
const editor_options: monaco.editor.IEditorOptions = {
	minimap: {enabled: false},
	lineNumbersMinChars: 3,
	lineDecorationsWidth: 5,
	stickyScroll: {enabled: true},
};

self.MonacoEnvironment = {
	getWorker(_, label) {
		if (label === "typescript" || label === "javascript")
			return new MonacoTsWorker();
		return new MonacoEditorWorker();
	}
}

export function create_editor(
	editor_wrapper: HTMLElement,
	initial_code_text: string,
	on_code_text_updated: (text: string) => void,
) {
	const editor = monaco.editor.create(editor_wrapper, {
		language: "javascript",
		value: initial_code_text,
		automaticLayout: true,
		placeholder: "// Write the bookmarklet code here",
		...global_editor_options,
		...editor_options,
	});
	const model = editor.getModel()!;

	const on_code_text_changed = () => {
		on_code_text_updated(editor.getValue());
	};
	on_code_text_changed();
	editor.onDidChangeModelContent(on_code_text_changed);

	const set_text = (text: string) => {
		const full_range = model.getFullModelRange();
		editor.executeEdits("set_text", [{
			range: full_range,
			text,
			forceMoveMarkers: true,
		}]);
	}

	return {
		set_text,
		focus: () => editor.focus(),
		dispose: () => editor.dispose(),
	};
}
