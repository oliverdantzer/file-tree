import { IgnoreCache } from "./ignore";
import { readdirSync, Dirent } from "fs";
import upath from "upath";

export abstract class FSObject {
  path: string;
  alias: string;
  isIgnored: boolean = false;

  constructor(path: string, alias: string) {
    this.path = path;
    this.alias = alias;
  }

  setIgnored(isIgnored: boolean): void {
    this.isIgnored = isIgnored;
  }

  static fromDirent(dirent: Dirent): FSObject {
    const path = upath.join(dirent.path, dirent.name);
    const basename = dirent.name;
    if (dirent.isDirectory()) {
      return new Dir(path, basename);
    } else {
      return new File(path, basename);
    }
  }
}

class File extends FSObject {
  constructor(path: string, alias: string) {
    super(path, alias);
  }
}
export class Dir extends FSObject {
  constructor(path: string, alias: string) {
    super(path, alias);
  }
  static fromPath(path: string): Dir {
    return new Dir(path, path);
  }
  getChildren(ig: IgnoreCache): FSObject[] {
    const children = readdirSync(this.path, { withFileTypes: true });
    ig.applyGitignore(this.path);
    return children.map((child) => {
      const fsObj = FSObject.fromDirent(child);
      if (ig.isIgnored(fsObj.path)) {
        fsObj.setIgnored(true);
      }
      return fsObj;
    });
  }
}
