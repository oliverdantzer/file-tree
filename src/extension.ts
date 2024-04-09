import { commands, ExtensionContext, Uri } from "vscode";
import {
  outputFileTreeFromDir,
  outputFileTreeFromWorkspace,
  outputFileTreeFromParentDir,
} from "./outputFileTree";

const extensionName = "file-tree";

export function activate(context: ExtensionContext) {
  console.log("File tree extension running");
  let disposables = [
    commands.registerCommand(
      `${extensionName}.outputFileTreeFromDir`,
      outputFileTreeFromDir
    ),
    commands.registerCommand(
      `${extensionName}.outputFileTreeFromWorkspace`,
      outputFileTreeFromWorkspace
    ),
    commands.registerCommand(
      `${extensionName}.outputFileTreeFromParentDir`,
      outputFileTreeFromParentDir
    ),
  ];

  context.subscriptions.push(...disposables);
}
// const anotherDisposable = vscode.commands.registerTextEditorCommand(
//   "extension.OpenWindow",
//   function () {
//     async function openWindow(content: string) {
//       const document = await vscode.workspace.openTextDocument({ content });
//       vscode.window.showTextDocument(document);
//     }
//     openWindow("");
//   }
// );

export function deactivate() {}
