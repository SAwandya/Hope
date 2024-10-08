// src/extension.ts

import * as vscode from "vscode";
import { uploadCode } from "./firebaseConfig";
import { SidebarProvider } from "./sidebarProvider";
import { UploadCodePanel } from "./uploadCodePanel";
import { db } from "./firebaseConfig"; // Import your Firestore instance
import { deleteDoc, doc, getDoc } from "firebase/firestore";

let sidebarProvider: SidebarProvider | undefined;

export function activate(context: vscode.ExtensionContext) {
  let sessionId = context.globalState.get("sessionId") as string;
  let studentId = context.globalState.get("studentId") as string;

  // Log sessionId and studentId when the extension activates
  console.log(`Extension "my-extension" is now active!`);
  console.log(`Session ID: ${sessionId}, Student ID: ${studentId}`);

  vscode.window.registerUriHandler({
    handleUri(uri: vscode.Uri) {
      console.log(`Received URI: ${uri.toString()}`);
      const query = new URLSearchParams(uri.query);

      // Get sessionId and studentId from the URI
      const newSessionId = query.get("sessionId");
      const newStudentId = query.get("studentId");

      if (newSessionId && newStudentId) {
        // Update the sessionId and studentId in the SidebarProvider
        sidebarProvider.updateSessionStudent(newSessionId, newStudentId);

        vscode.window.showInformationMessage(
          `Updated Session ID: ${newSessionId}, Student ID: ${newStudentId}`
        );
      }

      // Update global state
      if (newSessionId) {
        sessionId = newSessionId;
        context.globalState.update("sessionId", sessionId);
      }
      if (newStudentId) {
        studentId = newStudentId;
        context.globalState.update("studentId", studentId);
      }

      vscode.window.showInformationMessage(
        `Session ID: ${sessionId}, Student ID: ${studentId}`
      );

      // Log updated values
      console.log(`Updated Session ID: ${sessionId}, Student ID: ${studentId}`);

       if (sidebarProvider) {
         sidebarProvider.refresh();
       }
    },
  });


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

  // Command to prompt for commit message
  const enterCommitMessageCommand = vscode.commands.registerCommand(
    "extension.enterCommitMessage",
    async () => {
      const commitMessage = await vscode.window.showInputBox({
        placeHolder: "Enter your commit message",
        prompt: `Please enter the commit message for this version.\nSession ID: ${sessionId}\nStudent ID: ${studentId}`, // Updated prompt message
      });
      if (commitMessage) {
        sidebarProvider.setCommitMessage(commitMessage);
        vscode.window.showInformationMessage(
          `Commit message set: ${commitMessage}`
        );
      } else {
        vscode.window.showWarningMessage("No commit message entered.");
      }
    }
  );

  // Command to open the webview panel
  const openWebviewPanelCommand = vscode.commands.registerCommand(
    "extension.openWebviewPanel",
    () => {
      UploadCodePanel.createOrShow(context, studentId);
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
      const sessionId = context.globalState.get("sessionId") as string;
      const studentId = context.globalState.get("studentId") as string;

      const commitMessage = sidebarProvider.getCommitMessage(); // Retrieve the commit message

      if (!commitMessage) {
        vscode.window.showWarningMessage(
          `Please enter a commit message before uploading studentId: ${studentId} sessionID: ${sessionId}`
        );
        return;
      }

      try {
        const message = await uploadCode(
          sessionId,
          studentId,
          code,
          commitMessage
        );
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
          {
            enableScripts: true, // Enable JS in the webview
          }
        );

        panel.webview.html = getWebviewContent(code);

       panel.webview.onDidReceiveMessage(
         async (message) => {
           if (message.command === "deleteVersion") {
             // Handle delete version
             try {
               await deleteDoc(codeDocRef);
               vscode.window.showInformationMessage(message.text);

               // Close the webview panel after deletion
               panel.dispose();
             } catch (error) {
               vscode.window.showErrorMessage(
                 `Failed to delete version: ${
                   error instanceof Error ? error.message : "Unknown error"
                 }`
               );
             }
           }

           if (message.command === "loadInEditor") {
             // Open a new untitled text editor and load the code
             try {
               const document = await vscode.workspace.openTextDocument({
                 content: code, // Insert the loaded code
                 language: "javascript", // You can adjust the language here based on your needs
               });
               await vscode.window.showTextDocument(document);
               vscode.window.showInformationMessage("Code loaded in editor");
             } catch (error) {
               vscode.window.showErrorMessage(
                 `Failed to load code in editor: ${
                   error instanceof Error ? error.message : "Unknown error"
                 }`
               );
             }
           }
         },
         undefined,
         context.subscriptions
       );


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
    openVersionCommand,
    enterCommitMessageCommand
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
          background-color: #021526;
          padding: 10px;
          border-radius: 5px;
          overflow-x: auto;
          color: #FFFFFF;
        }
      </style>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    </head>
    <body>
      <h1>Code Version</h1>
      <pre><code>${code}</code></pre>
      <button id="loadButton" class="btn btn-primary">Load in Editor</button>
      <button id="deleteButton" class="btn btn-danger">Delete</button>

      <script>
        const vscode = acquireVsCodeApi();

        // Load code in editor button
        document.getElementById('loadButton').addEventListener('click', () => {
          vscode.postMessage({
            command: 'loadInEditor',
            text: 'Load code in editor'
          });
        });

        // Delete code version button
        document.getElementById('deleteButton').addEventListener('click', () => {
          vscode.postMessage({
            command: 'deleteVersion',
            text: 'Code version deleted successfully!'
          });
        });
      </script>
    </body>
    </html>
  `;
}


export function deactivate() {}
