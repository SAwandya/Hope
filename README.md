# Hope README

Hope is a custom version control system designed specifically for managing code versions within a Learning Management System (LMS). This extension enhances code version control by integrating with Firebase and providing an interactive sidebar and webview panels within Visual Studio Code.

## Features

Commit Code: Upload your code to Firebase with versioning.
View Previous Versions: Access and review previous versions of your code through an integrated sidebar and webview panel.
Real-Time Updates: See real-time updates of code versions in the sidebar.

## Requirements

Visual Studio Code: Version ^1.92.0 or later
Firebase: Ensure you have a Firebase project set up and configured.

## Extension Settings

This extension contributes the following settings:

hope.uploadCode: Command to upload code to Firebase.
hope.openSidebar: Command to open the custom sidebar view.
hope.openWebviewPanel: Command to open the upload code webview panel.
hope.openVersion: Command to open a specific version in a webview.

## Known Issues

There may be issues with real-time updates if Firebase is not correctly set up or if there are network connectivity problems.
Custom sidebar view focus behavior might vary depending on your VS Code setup.

## Release Notes

0.0.1
Initial release of the Hope extension with basic functionalities: uploading code, viewing previous versions, and real-time updates.
0.0.2
Fixed issues related to sidebar refresh and webview panel display.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

- Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
- Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
- Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
