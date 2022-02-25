function deletePath(cache, project, path, component) {
  return new Promise(async (resolve, reject) => {
    try {
      var proxyToComp = component && !project;
      if (proxyToComp) {
        var components = await fetch("/components.json");
        components = components ? await components.json() : {};
      }
      var componentPath = proxyToComp && components[component].path;
      path = path ? path[0] == "/" ? path : "/" + path : "";
      if (path.endsWith("/"))
        path = path.slice(0, path.length - 1);
      var proxyPath = proxyToComp ?
        (componentPath.indexOf('http://') === 0 || componentPath.indexOf('https://') === 0) ?
          componentPath + path :
          ("/" + componentPath + path).replace(/\/\//g, "/") :
        CACHEPATH + (project + path).replace(/\/\//g, "/");

      cache.delete(proxyPath).then(delres => {
        if (delres) {
          resolve({
            path,
            result: 1
          });
        } else reject({
          path,
          result: 0,
          error: "file not found",
          proxyPath,
          project,
          component
        });
      }, reject)
    } catch (e) {
      reject(e)
    }
  })
}