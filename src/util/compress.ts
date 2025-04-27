const default_format: CompressionFormat = "deflate";

// TODO: replace this with `ReadableStream.from` when it becomes more widely supported
function uint8_array_to_readable_stream(data: Uint8Array) {
	return new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(data);
			controller.close();
		}
	});
}

async function readable_stream_to_array_buffer(stream: ReadableStream) {
	const response = new Response(stream);
	return await response.arrayBuffer();
}

const text_encoder = new TextEncoder();

export async function compress_string(string: string, format = default_format) {
	const input_stream = uint8_array_to_readable_stream(text_encoder.encode(string));
	const compressed_stream = input_stream.pipeThrough(new CompressionStream(format));
	const array_buffer = await readable_stream_to_array_buffer(compressed_stream);
	return new Uint8Array(array_buffer);
}

const text_decoder = new TextDecoder();

export async function decompress_string(compressed_data: Uint8Array, format = default_format) {
	const compressed_stream = uint8_array_to_readable_stream(compressed_data);
	const decompressed_stream = compressed_stream.pipeThrough(new DecompressionStream(format));
	const array_buffer = await readable_stream_to_array_buffer(decompressed_stream);
	return text_decoder.decode(array_buffer);
}
