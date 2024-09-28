# File Structure Tree

Generates file trees of your project's directories, with an output similar to the `tree` command in Windows.
![Generate file structure tree from directory selection](images/from-selection-animation.gif)

## Features

- Ignores your .git directory and children of directories listed in your .gitignore
  > This means this extension won't print out your whole .git or node_modules directory.
  > ![.env ignored](images/ignored.png)
- Supports multiple nested .gitignore files
- Highlights your ignored files, which can for debugging which files your .gitignore is targeting.
