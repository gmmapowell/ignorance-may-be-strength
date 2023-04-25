import { TreeItem, TreeItemCollapsibleState, WorkspaceFolder } from "vscode";

export class ProjectTokens extends TreeItem {
	constructor(wf : WorkspaceFolder) {
		super(wf.name, TreeItemCollapsibleState.Collapsed);
	}
}
