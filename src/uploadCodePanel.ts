import * as vscode from "vscode";

export class UploadCodePanel {
  public static currentPanel: UploadCodePanel | undefined;

  public static createOrShow(context: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (UploadCodePanel.currentPanel) {
      UploadCodePanel.currentPanel.panel.reveal(column);
    } else {
      const panel = vscode.window.createWebviewPanel(
        "uploadCodePanel",
        "Upload Code Panel",
        column || vscode.ViewColumn.One,
        {}
      );

      UploadCodePanel.currentPanel = new UploadCodePanel(panel, context);
    }
  }

  private readonly panel: vscode.WebviewPanel;
  private readonly context: vscode.ExtensionContext;

  private constructor(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext
  ) {
    this.panel = panel;
    this.context = context;

    this.panel.webview.html = this.getWebviewContent();

    this.panel.onDidDispose(() => {
      UploadCodePanel.currentPanel = undefined;
    });
  }

  private getWebviewContent(): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Upload Code Panel</title>
    </head>
    <body>
      <h1>Upload Code</h1>
      <button id="uploadButton">Upload Code</button>
      <script>
        const vscode = acquireVsCodeApi();
        document.getElementById('uploadButton').addEventListener('click', () => {
          vscode.postMessage({ command: 'uploadCode' });
        });
      </script>
    </body>
    </html>`;
  }
}
