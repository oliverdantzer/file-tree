import { IgnoreCache } from './ignore';
import { readdirSync } from "fs";

export class FSObject {
    path: string;
    name: string;

    constructor(path: string, name: string) {
        this.path = path;
        this.name = name;
    }
}

// class File extends FSObject {
//     constructor(path: string, name: string) {
//         super(path, name);
//     }
// }

export class Dir extends FSObject {
    constructor(path: string, name: string) {
        super(path, name);
    }
    getChildren(ig: IgnoreCache): FSObject[] {
        const children = readdirSync(this.path, { withFileTypes: true });
        ig.applyGitignore(this.path);
        return children.map(child => {
            if (child.isDirectory()) {
                return new Dir(child.path, child.name);
            } else {
                return new FSObject(child.path, child.name);
            }
        }).filter(child => !ig.isIgnored(child.path));
    }
}