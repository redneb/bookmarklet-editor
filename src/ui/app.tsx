import {type Component} from "solid-js";

import {ImportPane} from "./import_pane";
import {EditorPane} from "./editor";
import {SettingsPane} from "./settings_pane";
import {ExportPane} from "./export_pane";

export const App: Component = () => {
	return (
		<>
			<ImportPane />
			<EditorPane />
			<SettingsPane />
			<ExportPane />
		</>
	);
};
