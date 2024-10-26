import { existsSync, readFileSync } from "fs";
import { minimatch } from "minimatch";
import upath from "upath";

export class IgnoreCache {
  patterns: string[];
  constructor(ignorePatterns: string[] = []) {
    this.patterns = ignorePatterns;
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
  const posixRootDirPath = upath.normalize(rootDirPath);
  let posixCurrentDir = upath.normalize(targetDirPath);

  if (!posixRootDirPath.includes(posixCurrentDir)) {
    throw new Error("rootDirPath must be a parent of targetDirPath");
  }

  while (posixCurrentDir !== posixRootDirPath) {
    ig.applyGitignore(posixCurrentDir);
    posixCurrentDir = upath.join(posixCurrentDir, "..");
  }
}
