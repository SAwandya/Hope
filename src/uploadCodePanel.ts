// uploadCodePanel.ts

import * as vscode from "vscode";
import { getAllSessions } from "./firebaseConfig";

export class UploadCodePanel {
  public static currentPanel: UploadCodePanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly context: vscode.ExtensionContext;

  public static async createOrShow(
    context: vscode.ExtensionContext,
    studentId: string
  ) {
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

      const uploadCodePanel = new UploadCodePanel(panel, context);
      await uploadCodePanel.updateWebview(studentId);
    }
  }

  private constructor(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext
  ) {
    this.panel = panel;
    this.context = context;

    this.panel.onDidDispose(() => {
      UploadCodePanel.currentPanel = undefined;
    });
  }

  // Fetch and display sessions
  private async updateWebview(studentId: string) {
    const sessions = await getAllSessions(studentId);
    this.panel.webview.html = this.getWebviewContent(sessions);
  }

  // Generate HTML content for webview
  private getWebviewContent(sessions: any[]): string {
    let sessionListHtml = "";
    sessions.forEach((session) => {
      sessionListHtml += `<li>Session ID: ${session.sessionId}</li>`;
    });

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Upload Code Panel</title>
    </head>
    <body>
      <h1>Upload Code</h1>
      <h2>Sessions</h2>
      <ul>
        ${sessionListHtml}
      </ul>
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
