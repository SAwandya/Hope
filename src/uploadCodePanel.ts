// src/uploadCodePanel.ts

import * as vscode from "vscode";

export class UploadCodePanel {
  public static currentPanel: UploadCodePanel | undefined;

  public static createOrShow(context: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor?.viewColumn;
    if (UploadCodePanel.currentPanel) {
      UploadCodePanel.currentPanel.panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "uploadCodePanel",
      "Upload Code",
      column || vscode.ViewColumn.One,
      {}
    );

    UploadCodePanel.currentPanel = new UploadCodePanel(panel, context);
  }

  private readonly panel: vscode.WebviewPanel;
  private readonly context: vscode.ExtensionContext;

  private constructor(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext
  ) {
    this.panel = panel;
    this.context = context;
    this.panel.onDidDispose(() => (UploadCodePanel.currentPanel = undefined));
    this.update();
  }

  public update() {
    this.panel.webview.html = this.getHtmlForWebview();
  }

  private getHtmlForWebview(): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <body>
      <h1>Upload Code Panel</h1>
      <p>Implement your panel content here.</p>
    </body>
    </html>`;
  }
}
