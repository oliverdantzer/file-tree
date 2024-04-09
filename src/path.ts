export function joinPaths(...unixPaths: string[]) {
  return unixPaths
    .reduce((a, b) => {
      return (
        (a.endsWith("/") ? a.slice(0, a.length - 1) : a) +
        "/" +
        (b.startsWith("/") ? b.slice(1, b.length) : b)
      );
    }, "")
    .replace(/^\/+/, ""); // remove leading slashes
}

export function winPathToUnixPath(path: string) {
  return path.replaceAll("\\", "/");
}
