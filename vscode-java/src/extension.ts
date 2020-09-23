/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as path from 'path';
import { workspace, languages, window, commands, ExtensionContext, Disposable } from 'vscode';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions
} from 'vscode-languageclient';
  
let client : LanguageClient;

export function activate(context: ExtensionContext) {
	// launch a Java Server
	let serverOptions: ServerOptions = {
		command: "java",
		args: [
			"-jar",
			path.resolve(context.extensionPath, '..', 'lsp-java', 'build', 'libs', 'lsp-java-all.jar')
		]
	};
	
	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
    	// Register for our languages
		documentSelector: [
			{ scheme: 'file', language: 'flas' },
			{ scheme: 'file', language: 'flas-st' }
		]
	};
	// Create the language client and start the client.
	client = new LanguageClient(
		'IgnorancePlugin',
		'Plugin through Ignorance',
		serverOptions,
		clientOptions
	);
	
	// Start the client. This will also launch the server
	client.start();
}
