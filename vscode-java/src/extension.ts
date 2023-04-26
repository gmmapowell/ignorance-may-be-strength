/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as net from 'net';
import * as fs from 'fs';
import * as path from 'path';
import { workspace, languages, window, commands, ExtensionContext, Disposable } from 'vscode';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	StreamInfo
} from 'vscode-languageclient';
import { TokensProvider } from './tokensprovider';
  
let client : LanguageClient;

export function activate(context: ExtensionContext) {
	var jarpath;
	var devpath = path.resolve(context.extensionPath, '..', 'lsp-java');
	if (fs.existsSync(devpath)) {
		jarpath = path.resolve(devpath, 'build', 'libs', 'lsp-java-all.jar');
	} else {
		jarpath = path.resolve(context.extensionPath, "lsp-java-all.jar");
	}

	const connectToServer = 9133;
	var serverOptions : ServerOptions;
	if (connectToServer) {
		serverOptions = connectViaSocket(connectToServer);
	} else {
		// launch a Java Server
		serverOptions = {
			command: "java",
			args: [
				"-jar",
				jarpath
			]
		};
	}
	
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

	client.onReady().then(() => {
		const tokensProvider = new TokensProvider();
		tokensProvider.loadTokens(client);
		window.registerTreeDataProvider('ignorantTokens', tokensProvider);
	});
}

function connectViaSocket(port: number) {
	return function() : Promise<StreamInfo> {
		return new Promise((resolve, reject) => {
			var sock : net.Socket = net.connect(port);
			var si : StreamInfo = { reader: sock, writer: sock };
			resolve(si);
		});
	};
}