import { ExtensionContext } from 'vscode';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions
} from 'vscode-languageclient/node';

export function activate(context: ExtensionContext) {
	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
    	// Register for our languages
		documentSelector: [
			{ scheme: 'file', language: 'abc' }
		]
	};
	let serverOptions: ServerOptions = { command: "" };

	// Create the language client and start the client.
	var client = new LanguageClient(
		'Abc',
		'Abc',
		serverOptions,
		clientOptions
	);
}
