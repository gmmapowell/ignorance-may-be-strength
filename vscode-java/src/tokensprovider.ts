import { Event, ProviderResult, TreeDataProvider, TreeItem } from "vscode";
import { ProjectTokens, Token, TokenLocation } from "./tokenlocation";
import * as vscode from 'vscode';

export class TokensProvider implements TreeDataProvider<ProjectTokens | Token | TokenLocation> {
	locations: ProjectTokens[];
	constructor() {
		this.locations = [];
		if (vscode.workspace.workspaceFolders == null)
			return;
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
		for (var wf=0;wf<vscode.workspace.workspaceFolders.length;wf++) {
			this.locations.push(new ProjectTokens(vscode.workspace.workspaceFolders[wf], tmp));
		}
	}

	onDidChangeTreeData?: Event<ProjectTokens | Token | TokenLocation | null | undefined> | undefined;
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