import { TreeItem, TreeItemCollapsibleState, WorkspaceFolder } from "vscode";

export class ProjectTokens extends TreeItem {
	tokens: Token[];
	constructor(wf : WorkspaceFolder, tokens : Token[]) {
		super(wf.name, TreeItemCollapsibleState.Collapsed);
		this.tokens = tokens;
	}

	children() : Promise<Token[]> {
		return Promise.resolve(this.tokens);
	}
}

export class Token extends TreeItem {
	locations: TokenLocation[];
	constructor(name: string, locations: TokenLocation[]) {
		super(name, TreeItemCollapsibleState.Collapsed);
		this.locations = locations;
	}

	children() : Promise<TokenLocation[]> {
		return Promise.resolve(this.locations);
	}
};

export class TokenLocation extends TreeItem {
	constructor(where: string) {
		super(where, TreeItemCollapsibleState.None);
	}

	children() : Promise<Token[]> {
		return Promise.resolve([]);
	}
};