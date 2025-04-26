/* @refresh reload */
import {render} from "solid-js/web";

import "./global_styles.css";
import {App} from "./app";

const app_root = document.getElementById("app");
if (!app_root)
	throw new Error("App root not found");

document.body.classList.remove("loading");
render(() => <App />, app_root);
