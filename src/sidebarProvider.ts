import * as vscode from "vscode";
import { db } from "./firebaseConfig"; // Import your Firestore instance
import { collection, onSnapshot } from "firebase/firestore";

export class SidebarProvider implements vscode.TreeDataProvider<SidebarItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<SidebarItem | undefined> =
    new vscode.EventEmitter<SidebarItem | undefined>();

  readonly onDidChangeTreeData: vscode.Event<SidebarItem | undefined> =
    this._onDidChangeTreeData.event;

  private sessionId: string = "00002";
  private studentId: string = "IT22004777";

  private versionItems: SidebarItem[] = [];
  private commitMessage: string = ""; // Add a commit message field

  constructor(private context: vscode.ExtensionContext) {
    this.setupRealtimeUpdates(); // Set up real-time updates when the class is initialized
  }

  getTreeItem(element: SidebarItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: SidebarItem): Promise<SidebarItem[]> {
    if (!element) {
      // Root level: list actions and versions
      return [
        new SidebarItem(
          "Enter Commit Message",
          vscode.TreeItemCollapsibleState.None,
          "extension.enterCommitMessage"
        ),
        new SidebarItem(
          "Upload Code",
          vscode.TreeItemCollapsibleState.None,
          "extension.uploadCode"
        ),
        new SidebarItem(
          "Open Webview",
          vscode.TreeItemCollapsibleState.None,
          "extension.openWebviewPanel"
        ),
        ...this.versionItems,
      ];
    }
    return [];
  }

  private setupRealtimeUpdates() {
    const versionCollectionRef = collection(
      db,
      `sessions/${this.sessionId}/students/${this.studentId}/codeVersions`
    );

    // Listen for real-time updates
    onSnapshot(versionCollectionRef, (snapshot) => {
      this.versionItems = snapshot.docs.map((doc) => {
        return new SidebarItem(
          `Version ${doc.id}`, // Display version names like "Version 1"
          vscode.TreeItemCollapsibleState.None,
          "extension.openVersion",
          {
            sessionId: this.sessionId,
            studentId: this.studentId,
            versionId: doc.id,
          }
        );
      });
      this.refresh(); // Refresh the tree view when new data is available
    });
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  setCommitMessage(message: string): void {
    this.commitMessage = message;
  }

  getCommitMessage(): string {
    return this.commitMessage;
  }
}

class SidebarItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    commandId?: string,
    commandArgs?: any // Additional argument for the command
  ) {
    super(label, collapsibleState);
    if (commandId) {
      this.command = {
        command: commandId,
        title: label,
        arguments: [commandArgs], // Pass the arguments to the command
      };
    }
  }
}
