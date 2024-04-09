import * as fs from "fs";
import { joinPaths, winPathToUnixPath } from "./path";
import { minimatch } from "minimatch";

export class Ignore {
  patterns: string[];
  constructor(ignorePatterns?: string[]) {
    this.patterns = [`**/.git`].concat(ignorePatterns || []);
  }
  add(ignorePatterns: string, dirPath: string): void {
    this.patterns.push(
      ...ignorePatterns
        .split("\n")
        .map((line) => line.trim().replace(new RegExp(`/$`, "g"), "")) // trim whitespace and remove / at end of line
        .filter(
          (line) => !(line.startsWith("#") || line === "\n" || line === "")
        )
        .map((pattern) => joinPaths(dirPath, pattern))
    );
  }
  applyGitignore(dirPath: string): void {
    let gitignorePath = joinPaths(dirPath, ".gitignore");
    if (fs.existsSync(gitignorePath)) {
      let gitignoreContent = fs.readFileSync(gitignorePath).toString();
      this.add(gitignoreContent, dirPath);
    }
  }
  ignores(entryPath: string): boolean {
    return this.patterns.some((pattern) => {
      return minimatch(entryPath, pattern);
    });
  }
  toString(): string {
    return this.patterns.join("\n");
  }
}

export function applyGitignoreAbove(
  ig: Ignore,
  rootDirPath: string,
  targetDirPath: string
): void {
  let currentDir = rootDirPath.split("/");
  let targetDir = targetDirPath.split("/");
  let currentPath = rootDirPath;
  for (let i = currentDir.length; i < targetDir.length; i++) {
    ig.applyGitignore(currentPath);
    currentPath = joinPaths(currentPath, targetDir[i]);
  }
}
