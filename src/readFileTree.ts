import { Dir, FSObject } from "./filesystem";
import { IgnoreCache } from "./ignore";

enum Connector {
  TAB = "   ",
  LINE = "│  ",
  T = "├─ ",
  L = "└─ ",
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
class DirTreeReader {
  #out: Out;
  #ignore: IgnoreCache;
  constructor(path: string, ignore: IgnoreCache) {
    this.#out = new Out();
    this.#ignore = ignore;
    this.#recReadDir(new Dir(path, path), "", true);
  }
  #recReadDir(obj: FSObject, context: string, isLast: boolean): void {
    console.log(obj.path);
    if (obj instanceof Dir) {
      const childConnector = isLast ? Connector.TAB : Connector.LINE;
      const childContext = context + childConnector;
      const children = obj.getChildren(this.#ignore);
      children.forEach((child, index) => {
        const isChildLast = index === children.length - 1;
        this.#recReadDir(child, childContext, isChildLast);
      });
    }
    const myConnector = isLast ? Connector.L : Connector.T;
    this.#out.println(context + myConnector + obj.name);
  }
  result(): string {
    return this.#out.buffer;
  }
}

export function readDirTree(dirPath: string, ig: IgnoreCache): string {
  const tree = new DirTreeReader(dirPath, ig);
  return tree.result();
}
