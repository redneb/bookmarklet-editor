export function unreachable(value: never): never {
	throw new Error(`This should not happen: value === ${JSON.stringify(value)}`);
}
