import assert from "assert";
import { Ignore } from "./ignore";
import fs from "fs";
import path from "path";

class TreeNode {
  name: string;
  children: TreeNode[] | null; // null if file, TreeNode[] if directory
  constructor(name: string) {
    this.name = name;
    this.children = null;
  }
  pushNewChild(name: string): TreeNode {
    assert(this.children !== null, "pushNewChild called on file node");
    const child = new TreeNode(name);
    this.children.push(child);
    return child;
  }
  read(
    readFunction: (entryName: string, depth: number) => void,
    depth: number = 0
  ): void {
    readFunction(this.name, depth);
    if (this.children === null) {
      return;
    }
    this.children.map((child) => child.read(readFunction, depth + 1));
  }
}

export class FileTree {
  root: TreeNode;
  ig: Ignore;
  constructor(dirPath: string, ig: Ignore) {
    this.ig = ig || new Ignore();
    this.root = new TreeNode(dirPath);
    this.recursiveGenerateTree(this.root.name, this.root);
  }
  recursiveGenerateTree(dirPath: string, node: TreeNode) {
    console.log("dirPath: ", dirPath);
    this.ig.applyGitignore(dirPath);
    let result = "";
    fs.readdirSync(dirPath, { withFileTypes: true }).map((entry) => {
      if (!this.ig.ignores(entry.path)) {
        if (entry.isDirectory()) {
          const child = node.pushNewChild(entry.name);
          child.children = [];
          this.recursiveGenerateTree(entry.path, child);
        } else {
          node.pushNewChild(entry.name);
        }
      }
    });
  }
  read() {
    let output = "";
    this.root.read((entryName, depth) => {
      let prefix = "";
      for (let i = 0; i++; i < depth) {
        prefix += "   ";
      }
      output += `${prefix}${entryName}\n`;
    });
    return output;
  }
}
