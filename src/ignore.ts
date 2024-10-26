import { existsSync, readFileSync } from "fs";
import { minimatch } from "minimatch";
import upath from "upath";

const defaultIgnorePatterns: string[] = [];

export class IgnoreCache {
  patterns: string[];
  constructor(ignorePatterns: string[] = []) {
    this.patterns = [...defaultIgnorePatterns, ...ignorePatterns];
  }
  
  add(ignorePatterns: string, dirPath: string): void {
    this.patterns.push(
      ...ignorePatterns
        .split("\n")
        .map((line) => line.trim().replace(new RegExp(`/$`, "g"), "")) // trim whitespace and remove / at end of line
        .filter(
          (line) => !(line.startsWith("#") || line === "\n" || line === "")
        )
        .map((pattern) => upath.join(dirPath, pattern))
    );
  }

  applyGitignore(dirPath: string): void {
    const posixDirPath = upath.normalize(dirPath);
    let gitignorePath = upath.join(posixDirPath, ".gitignore");
    if (existsSync(gitignorePath)) {
      let gitignoreContent = readFileSync(gitignorePath).toString();
      this.add(gitignoreContent, posixDirPath);
    }
  }

  isIgnored(somePath: string): boolean {
    const posixPath = upath.normalize(somePath);
    return this.patterns.some((pattern) => {
      return minimatch(posixPath, pattern);
    });
  }

  toString(): string {
    return this.patterns.join("\n");
  }
}

export function applyGitignoreAbove(
  ig: IgnoreCache,
  rootDirPath: string,
  targetDirPath: string
): void {
  const posixRootPath = upath.normalize(rootDirPath);
  let posixCurrentPath = upath.normalize(targetDirPath);

  if (!posixCurrentPath.includes(posixRootPath)) {
    throw new Error("rootDirPath must be a parent of targetDirPath");
  }

  while (posixCurrentPath !== posixRootPath) {
    ig.applyGitignore(posixCurrentPath);
    posixCurrentPath = upath.join(posixCurrentPath, "..");
  }
}
