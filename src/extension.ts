// src/extension.ts

import * as vscode from "vscode";
import { uploadCode } from "./firebaseConfig";
import { SidebarProvider } from "./sidebarProvider";
import { UploadCodePanel } from "./uploadCodePanel";
import { db } from "./firebaseConfig"; // Import your Firestore instance
import { doc, getDoc } from "firebase/firestore";

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "my-extension" is now active!');

  // Initialize the SidebarProvider and create the tree view
  const sidebarProvider = new SidebarProvider(context);
  vscode.window.createTreeView("mySidebar", {
    treeDataProvider: sidebarProvider,
  });

  // Command to open the sidebar view
  const openSidebarCommand = vscode.commands.registerCommand(
    "extension.openSidebar",
    () => {
      vscode.commands.executeCommand("workbench.view.explorer"); // This opens the Explorer view by default
      // To focus on the custom sidebar view, additional steps may be needed depending on your setup
    }
  );

  // Command to open the webview panel
  const openWebviewPanelCommand = vscode.commands.registerCommand(
    "extension.openWebviewPanel",
    () => {
      UploadCodePanel.createOrShow(context);
    }
  );

  // Command to upload code
  const uploadCodeCommand = vscode.commands.registerCommand(
    "extension.uploadCode",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("No editor is active");
        return;
      }

      const code = editor.document.getText();
      const sessionId = "00002"; // Replace with actual session ID logic
      const studentId = "IT22004777"; // Replace with actual student ID logic

      try {
        const message = await uploadCode(sessionId, studentId, code);
        if (message) {
          vscode.window.showInformationMessage(message);
          sidebarProvider.refresh(); // Refresh the sidebar to reflect the new version
        }
      } catch (error) {
        if (error instanceof Error) {
          vscode.window.showErrorMessage(
            `Error uploading code: ${error.message}`
          );
        } else {
          vscode.window.showErrorMessage(`An unknown error occurred`);
        }
      }
    }
  );

  // Command to open a specific version in a webview
  const openVersionCommand = vscode.commands.registerCommand(
    "extension.openVersion",
    async (args: {
      sessionId: string;
      studentId: string;
      versionId: string;
    }) => {
      const { sessionId, studentId, versionId } = args;

      try {
        const codeDocRef = doc(
          db,
          `sessions/${sessionId}/students/${studentId}/codeVersions/${versionId}`
        );
        const codeDoc = await getDoc(codeDocRef);
        const code = codeDoc.exists() ? codeDoc.data()?.code : "Code not found";

        const panel = vscode.window.createWebviewPanel(
          "versionView", // Identifies the type of the webview
          `Version ${versionId}`, // Title of the webview
          vscode.ViewColumn.One, // Editor column to show the new webview panel in
          {} // Webview options
        );

        panel.webview.html = getWebviewContent(code);
      } catch (error) {
        vscode.window.showErrorMessage(
          `Error opening version: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  );

  // Register commands and dispose them when deactivated
  context.subscriptions.push(
    openSidebarCommand,
    openWebviewPanelCommand,
    uploadCodeCommand,
    openVersionCommand
  );

  // Optional: Add a status bar button to upload code
  let statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBar.text = "Upload Code";
  statusBar.command = "extension.uploadCode";
  statusBar.show();

  context.subscriptions.push(statusBar);
}

// Function to get HTML content for the webview
function getWebviewContent(code: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Code Version</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 10px;
        }
        pre {
          background-color: #F8EDED;
          padding: 10px;
          border-radius: 5px;
          overflow-x: auto;
          color: #173B45
        }
      </style>
    </head>
    <body>
      <h1>Code Version</h1>
      <pre>${code}</pre>
    </body>
    </html>
  `;
}

export function deactivate() {}
