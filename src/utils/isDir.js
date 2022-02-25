async function isDir(path, component, project) {
  var proxyToComp = component && !project;
  if (proxyToComp) {
    var components = await fetch("/components.json");
    components = components ? await components.json() : {};
  }
  project = project || tilepieces.currentProject;
  path = path[0] == "/" ? path.slice(1) : path;
  if (!path)
    return true;
  var parentDirectoryAsArray = path.split("/");
  var resourceName = parentDirectoryAsArray.pop();
  var parentDirectory = parentDirectoryAsArray.length ? "/" + parentDirectoryAsArray.join("/") : "";
  var cache = await caches.open(CACHEFILES);
  parentDirectory = parentDirectory ?
    parentDirectory[0] == "/" ? parentDirectory : "/" + parentDirectory :
    "";
  var componentPath = proxyToComp && components[component].path;
  var cacheToMatch = proxyToComp ? (componentPath.indexOf('http://') === 0 || componentPath.indexOf('https://') === 0) ?
      componentPath + parentDirectory :
      (componentPath + parentDirectory).replace(/\/\//g, "/") :
    CACHEPATH + (project + parentDirectory).replace(/\/\//g, "/");
  var readParent = await cache.match(new Request(cacheToMatch));
  if (!readParent) {
    throw new Error("[isDir] error in reading parent path (path,cacheToMatch,parentDirectory) ->"
      + path + " , " + cacheToMatch + " , " + parentDirectory);
  }
  var json = await readParent.json();
  if (typeof json[resourceName] === "object")
    return true;
}