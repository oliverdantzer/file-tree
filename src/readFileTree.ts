import { Ignore } from "./ignore";
import { readdirSync, Dirent, statSync } from "fs";
import { joinPaths, winPathToUnixPath } from "./path";

type ReadFunc = (filename: string, depth: number) => string;

function fileToStr(filename: string, depth: number) {
  return `${"\t".repeat(depth)}${filename}`;
}

function dirToStr(filename: string, depth: number) {
  return `${"\t".repeat(depth)}${filename}/`;
}

enum branch {
  none = " ",
  between = "│",
  middleConnected = "├",
  lastConnected = "└",
}

export class Tree {
  buffer: string = "";
  constructor(public ignore: Ignore, public selectedPath: string) { }
  readFile(
    filename: string,
    branches: branch[],
    isDir: boolean,
    ignored: boolean = false
  ) {
    let branchesString = branches.reduce((a, b) => {
      const connection =
        a in [branch.middleConnected, branch.lastConnected] ? "──" : "  ";
      return a + connection + b;
    }, "");
    let branchesStringSuffix = "─ ";
    // if (!isDir) {
    //   branchesStringSuffix = "──>";
    // }
    if (ignored) {
      // branchesString = branchesString.replace(branch.lastConnected, "┗");
      // branchesString = branchesString.replace(branch.middleConnected, "┣");
      branchesStringSuffix = "─]";
    }
    if (branches.length === 0) {
      branchesStringSuffix = "";
    }
    this.buffer += `${branchesString}${branchesStringSuffix}${filename}${isDir ? "/" : ""
      }${ignored ? " (ignored)" : ""}\n`;
  }
  read(): string {
    this.recTree(this.selectedPath, this.selectedPath, [], true, true);
    return this.buffer;
  }
  recTree(
    path: string,
    name: string,
    branches: branch[],
    isDir: boolean,
    isLast: boolean
  ) {
    if (name === ".git") {
      if (branches.length === 0) {
        this.readFile(name, branches, isDir);
      } else {
        return;
      }
    }
    if (this.ignore.ignores(path)) {
      this.readFile(name, branches, isDir, true);
    } else {
      this.readFile(name, branches, isDir);
      if (isDir) {
        let entries = readdirSync(path, { withFileTypes: true });
        this.ignore.applyGitignore(path);
        entries.sort((a, b) => {
          // Directories first
          if (a.isDirectory() && b.isFile()) {
            return -1;
          }
          if (b.isDirectory() && a.isFile()) {
            return 1;
          }

          // Lexicographical order
          return a.name.localeCompare(b.name);
        });
        entries.map((entry, index) => {
          const entryBranches = [...branches];

          // If dir is last entry of its parent, change branch at that level to none,
          // otherwise change it to between
          if (entryBranches.length !== 0) {
            if (isLast) {
              entryBranches[entryBranches.length - 1] = branch.none;
            } else {
              entryBranches[entryBranches.length - 1] = branch.between;
            }
          }

          const isChildLast = index === entries.length - 1;
          // If child is last, add lastConnected to its branches, otherwise add middleConnected
          if (isChildLast) {
            entryBranches.push(branch.lastConnected);
          } else {
            entryBranches.push(branch.middleConnected);
          }
          this.recTree(
            joinPaths(path, entry.name),
            entry.name,
            entryBranches,
            entry.isDirectory(),
            isChildLast
          );
        });
      } // else is file, maybe symbolic link?
    }
  }
}
