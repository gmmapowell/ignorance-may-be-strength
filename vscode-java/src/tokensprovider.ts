import { Event, ProviderResult, TreeDataProvider, TreeItem } from "vscode";
import { ProjectTokens } from "./tokenlocation";
import * as vscode from 'vscode';

export class TokensProvider implements TreeDataProvider<ProjectTokens> {
	locations: ProjectTokens[];
	constructor() {
		this.locations = [];
		if (vscode.workspace.workspaceFolders == null)
			return;
		for (var wf=0;wf<vscode.workspace.workspaceFolders.length;wf++) {
			this.locations.push(new ProjectTokens(vscode.workspace.workspaceFolders[wf]));
		}
	}

	onDidChangeTreeData?: Event<ProjectTokens | null | undefined> | undefined;
	getChildren(element?: ProjectTokens | undefined): ProviderResult<ProjectTokens[]> {
		if (!element) { // it wants the top list
			if (!this.locations) {
				return Promise.resolve([]);
			} else {
				return Promise.resolve(this.locations);
			}
		}
	}
	getTreeItem(element: ProjectTokens): TreeItem {
		return element;
	}
	getParent?(element: ProjectTokens): ProviderResult<ProjectTokens> {
		throw new Error("Method not implemented.");
	}
}