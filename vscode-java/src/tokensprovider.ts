import { Event, ProviderResult, TreeDataProvider, TreeItem } from "vscode";
import { ProjectTokens, Token, TokenLocation } from "./tokenlocation";
import * as vscode from 'vscode';
import { ExecuteCommandRequest, LanguageClient } from "vscode-languageclient";

export class TokensProvider implements TreeDataProvider<ProjectTokens | Token | TokenLocation> {
	locations: ProjectTokens[];
	constructor() {
		this.locations = [];
		const tmp = [
			new Token("List", [
				new TokenLocation("46.2"),
				new TokenLocation("53.1")
			]),
			new Token("Map", [
				new TokenLocation("15.7"),
				new TokenLocation("28.9")
			])
		];
	}

	async loadTokens(client: LanguageClient) : Promise<undefined> {
		if (vscode.workspace.workspaceFolders == null)
			return;
		for (var wf=0;wf<vscode.workspace.workspaceFolders.length;wf++) {
			let uri = vscode.workspace.workspaceFolders[wf].uri.toString();
			const result = await client.sendRequest(ExecuteCommandRequest.type, {
				command: 'java.lsp.requestTokens',
				arguments: [ uri ]
			});
			this.locations.push(new ProjectTokens(vscode.workspace.workspaceFolders[wf], this.tokenize(result)));
		}
		this._onDidChangeTreeData.fire();
	}

	tokenize(list : Array<any>) : Token[] {
		var ret = [];
		for (var i=0;i<list.length;i++) {
			var item  : any = list[i];
			ret.push(new Token(item.name, this.locationsIn(item.locations)));
		}
		return ret;
	}

	locationsIn(list: Array<any>) : TokenLocation[] {
		var ret = [];
		for (var i=0;i<list.length;i++) {
			var item  : any = list[i];
			ret.push(new TokenLocation("" + item.line + "." + item.char));
		}
		return ret;
	}

	private _onDidChangeTreeData: vscode.EventEmitter<ProjectTokens | Token | TokenLocation | null | undefined> = new vscode.EventEmitter<ProjectTokens | Token | TokenLocation | null | undefined>();
	readonly onDidChangeTreeData: vscode.Event<ProjectTokens | Token | TokenLocation | null | undefined> = this._onDidChangeTreeData.event;

	getChildren(element?: ProjectTokens | Token | TokenLocation | undefined): ProviderResult<ProjectTokens[] | Token[] | TokenLocation[]> {
		if (!element) { // it wants the top list
			if (!this.locations) {
				return Promise.resolve([]);
			} else {
				return Promise.resolve(this.locations);
			}
		} else {
			return element.children();
		}
	}
	getTreeItem(element: ProjectTokens | Token | TokenLocation): TreeItem {
		return element;
	}
	getParent?(element: ProjectTokens | Token | TokenLocation): ProviderResult<ProjectTokens | Token | TokenLocation> {
		throw new Error("Method not implemented.");
	}
}