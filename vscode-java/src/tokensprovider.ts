import { Event, ProviderResult, TreeDataProvider, TreeItem } from "vscode";
import { ProjectTokens, Token, TokenLocation } from "./tokenlocation";
import * as vscode from 'vscode';
import { ExecuteCommandRequest, LanguageClient } from "vscode-languageclient";

export class TokensProvider implements TreeDataProvider<ProjectTokens | Token | TokenLocation> {
	locations: ProjectTokens[];
	constructor() {
		this.locations = [];
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
		this._onDidChangeTreeData.fire(null);
	}

	setTokens(tokens: any) {
		var uri : string = tokens.uri;
		if (uri.endsWith("/"))
			uri = uri.substring(0, uri.length-1);
		if (vscode.workspace.workspaceFolders == null)
			return;
		var folder = null;
		for (var wf=0;wf<vscode.workspace.workspaceFolders.length;wf++) {
			var f = vscode.workspace.workspaceFolders[wf];
			if (f.uri.toString() == uri) {
				folder = f;
				break;
			}
		}
		if (folder == null)
			return;
		var done = false;
		var curr : ProjectTokens = new ProjectTokens(folder, this.tokenize(tokens.tokens));
		for (var i=0;i<this.locations.length;i++) {
			var pt : ProjectTokens = this.locations[i];
			if (!pt.label) continue;
			if (folder.name == pt.label) {
				this.locations[i] = curr;
				done = true;
				break;
			} else if (folder.name < pt.label) {
				this.locations.splice(i, 0, curr);
				done = true;
				break;
			}
		}
		if (!done) {
			this.locations.push(curr);
		}
		this._onDidChangeTreeData.fire(null);
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