import { Uri, workspace, window } from "vscode";
import { readDirTree } from "./readFileTree";
import { IgnoreCache, applyGitignoreAbove } from "./ignore";
import path from "path";

async function outputFileTree(
  dirPathUnix: string,
  ig: IgnoreCache = new IgnoreCache()
) {
  // Read the configuration settings
  // let config = workspace.getConfiguration(extensionName);
  // let ignorePatterns = config.get("ignorePatterns") as string[];
  // let useGitignore = config.get("useGitignore") as boolean;

  // Generate the file tree
  let tree = readDirTree(dirPathUnix, ig);

  const document = await workspace.openTextDocument({
    content: tree,
    language: "tree",
  });
  window.showTextDocument(document);
}

export function outputFileTreeRelativeToWorkspace(dirPath: string): void {
  let ig = new IgnoreCache();

  const rootWorkspace = workspace.getWorkspaceFolder(Uri.file(dirPath));
  const rootPath = rootWorkspace?.uri.fsPath;

  // Generate ignores from rootPath to dir.fsPath/..
  if (rootPath) {
    applyGitignoreAbove(ig, rootPath, dirPath);
  }

  outputFileTree(dirPath, ig);
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
  outputFileTree(rootPath);
}
