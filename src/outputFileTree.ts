import { Uri, workspace, WorkspaceFolder, window } from "vscode";
import { Tree } from "./readFileTree";
import { Ignore, applyGitignoreAbove } from "./ignore";
import { joinPaths, winPathToUnixPath } from "./path";
import path from "path";
import {} from "fs";

async function outputFileTree(dirPathUnix: string, ig: Ignore = new Ignore()) {
  // Read the configuration settings
  // let config = workspace.getConfiguration(extensionName);
  // let ignorePatterns = config.get("ignorePatterns") as string[];
  // let useGitignore = config.get("useGitignore") as boolean;
  // Generate the file tree
  console.log("ig: ", ig.patterns);
  console.log("Generating file tree:");
  let tree = new Tree(ig, dirPathUnix);
  console.log("output follows:");
  const output = tree.read();
  console.log(output);
  const document = await workspace.openTextDocument({
    content: output,
    language: "tree",
  });
  window.showTextDocument(document);
}

export function outputFileTreeRelativeToWorkspace(dirPath: string): void {
  const dirPathUnix = winPathToUnixPath(dirPath);
  // Instantiate the ignore
  let ig = new Ignore();
  // ignorePatterns.map((pattern) => ig.add(pattern));
  const rootWorkspace = workspace.getWorkspaceFolder(Uri.file(dirPath));
  const rootPath = rootWorkspace?.uri.fsPath;

  // Generate ignores from rootPath to dir.fsPath/..
  if (rootPath && !(rootPath === dirPath)) {
    const rootPathUnix = winPathToUnixPath(rootPath);
    applyGitignoreAbove(ig, rootPathUnix, dirPathUnix);
  }
  outputFileTree(dirPathUnix, ig);
}

export function outputFileTreeFromDir(dir: Uri): void {
  outputFileTreeRelativeToWorkspace(dir.fsPath);
}
export function outputFileTreeFromParentDir(uri: Uri) {
  const parentDir = path.resolve(uri.fsPath, "..");
  outputFileTreeRelativeToWorkspace(parentDir);
}

export function outputFileTreeFromWorkspace(uri: Uri) {
  const rootWorkspace = workspace.getWorkspaceFolder(uri);
  const rootPath = rootWorkspace?.uri.fsPath;
  if (!rootPath) {
    throw new Error("No workspace folder found");
  }
  const rootPathUnix = winPathToUnixPath(rootPath);
  outputFileTree(rootPathUnix);
}
