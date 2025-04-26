export const read_clipboard =
	navigator.clipboard?.readText
		? () => navigator.clipboard.readText()
		: async () => prompt("Please paste the bookmarklet URL");
