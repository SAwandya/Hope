// src/extension.ts

import * as vscode from "vscode";
import { uploadCode } from "./firebaseConfig";
import { SidebarProvider } from "./sidebarProvider";
import { UploadCodePanel } from "./uploadCodePanel";

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "my-extension" is now active!');

  const sidebarProvider = new SidebarProvider();
  vscode.window.createTreeView("mySidebar", {
    treeDataProvider: sidebarProvider,
  });

  const uploadCodePanel = vscode.commands.registerCommand(
    "extension.uploadCodePanel",
    () => {
      UploadCodePanel.createOrShow(context);
    }
  );

  let disposable = vscode.commands.registerCommand(
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
        }
      } catch (error) {
        if (error instanceof Error) {
          vscode.window.showErrorMessage(
            `Error uploading code: ${error.message}`
          );
        } else {
          vscode.window.showErrorMessage(`An unkonwn error occurred`);
        }
      }
    }
  );

 
  context.subscriptions.push(disposable, uploadCodePanel);

  // Optional: Add a status bar button
  let statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBar.text = "Upload Code";
  statusBar.command = "extension.uploadCode";
  statusBar.show();

  context.subscriptions.push(statusBar);
}

export function deactivate() {}
