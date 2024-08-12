import * as vscode from "vscode";
import { db, collection, addDoc, serverTimestamp } from "./firebaseConfig";

export function activate(context: vscode.ExtensionContext) {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.text = "$(cloud-upload) Upload Code";
  statusBarItem.command = "extension.uploadCode";
  statusBarItem.tooltip = "Upload your code to Firebase";
  statusBarItem.show();

  context.subscriptions.push(statusBarItem);

  let disposable = vscode.commands.registerCommand(
    "extension.uploadCode",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return;
      }

      const code = editor.document.getText();
      const versionNumber = `v${Date.now()}`;

      try {
        await addDoc(collection(db, "codeVersions"), {
          userId: "student123", // Replace with actual user ID or obtain from authentication
          code: code,
          versionNumber: versionNumber,
          timestamp: serverTimestamp(),
        });
        vscode.window.showInformationMessage("Code uploaded successfully!");
      } catch (error) {
         if (error instanceof Error) {
           vscode.window.showErrorMessage(
             "Error uploading code: " + error.message
           );
         } else {
           vscode.window.showErrorMessage("An unknown error occurred.");
         }
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
