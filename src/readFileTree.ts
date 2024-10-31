import { Dirent } from "fs";
import { Dir, FSObject } from "./filesystem";
import { IgnoreCache } from "./ignore";
import upath from "upath";

enum Connector {
  TAB = "    ",
  LINE = "│   ",
  T = "├── ",
  L = "└── ",
  T_IGNORED = "├─] ",
  L_IGNORED = "└─] ",
}

class Out {
  buffer: string;

  constructor() {
    this.buffer = "";
  }

  println(str: string) {
    this.buffer += str + "\n";
  }
}

const defaultSkipAliases: string[] = [".git"];
class DirTreeReader {
  #out: Out;
  #ignore: IgnoreCache;
  constructor(path: string, ignore: IgnoreCache) {
    this.#out = new Out();
    this.#ignore = ignore;
    this.#recReadDir(Dir.fromPath(path), "", true, true);
  }

  #recReadDir(
    obj: FSObject,
    context: string,
    isLast: boolean,
    noTabOnce?: boolean
  ): void {
    if (defaultSkipAliases.includes(obj.alias)) {
      return;
    }

    let myConnector: string;
    if (isLast) {
      myConnector = obj.isIgnored ? Connector.L_IGNORED : Connector.L;
    } else {
      myConnector = obj.isIgnored ? Connector.T_IGNORED : Connector.T;
    }
    if (noTabOnce) {
      myConnector = "";
    }

    const normalizedAlias = upath.normalize(obj.alias);

    const suffix =
      (obj instanceof Dir ? "/" : "") + (obj.isIgnored ? " (ignored)" : "");

    this.#out.println(context + myConnector + normalizedAlias + suffix);

    // If obj is a directory, recursively read its children
    if (obj instanceof Dir && !obj.isIgnored) {
      let childConnector: string = isLast ? Connector.TAB : Connector.LINE;
      if (noTabOnce) {
        childConnector = "";
      }
      const childContext = context + childConnector;
      const children = obj.getChildren(this.#ignore);
      children.forEach((child, index) => {
        const isChildLast = index === children.length - 1;
        this.#recReadDir(child, childContext, isChildLast);
      });
    }
  }

  result(): string {
    return this.#out.buffer;
  }
}

export function readDirTree(dirPath: string, ig: IgnoreCache): string {
  const tree = new DirTreeReader(dirPath, ig);
  return tree.result();
}
