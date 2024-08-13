import * as vscode from "vscode";

export class SidebarProvider implements vscode.TreeDataProvider<SidebarItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<SidebarItem | undefined> =
    new vscode.EventEmitter<SidebarItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<SidebarItem | undefined> =
    this._onDidChangeTreeData.event;

  getTreeItem(element: SidebarItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: SidebarItem): Thenable<SidebarItem[]> {
    if (element === undefined) {
      return Promise.resolve([
        new SidebarItem("Upload Code", vscode.TreeItemCollapsibleState.None),
      ]);
    }
    return Promise.resolve([]);
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }
}

class SidebarItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.command = {
      command: "extension.uploadCode",
      title: "Upload Code",
    };
  }
}
