function read(path, component, project, raw = false) {
  return new Promise(async (resolve, reject) => {
    try {
      await swStart();
      var proxyToComp = component && !project;
      var cache = await caches.open(CACHEFILES);
      if (proxyToComp) {
        var components = await fetch("/components.json");
        components = components ? await components.json() : {};
      }
      project = project || tilepieces.currentProject;
      path = path ? path[0] == "/" ? path : "/" + path : "";
      if (path.endsWith("/"))
        path = path.slice(0, path.length - 1);
      try {
        var isdir = await isDir(path, component, component ? null : project);
      } catch (e) {
      }
      var componentPath = proxyToComp && components[component].path;
      var proxyPath = proxyToComp ?
        (componentPath.indexOf('http://') === 0 || componentPath.indexOf('https://') === 0) ?
          componentPath + path :
          ("/" + componentPath + path).replace(/\/+/g, "/") :
        CACHEPATH + (project + path).replace(/\/+/g, "/");
      var responseObj = await cache.match(new Request(proxyPath));
      if (responseObj) {
        if (raw)
          return resolve(responseObj);
        contentTypeRepresentation(responseObj.headers.get('Content-Type'), responseObj)
          .then(res => {
            if (isdir) {
              var json = JSON.parse(res);
              var dirs = [];
              var files = [];
              var objDir = {};
              for (const [key, value] of Object.entries(json)) {
                if (typeof value == "object")
                  dirs.push({key, value});
                else
                  files.push({key, value})
              }
              dirs.sort((a, b) => a.key.localeCompare(b.key))
                .forEach(v => objDir[v.key] = {});
              files.sort((a, b) => a.key.localeCompare(b.key))
                .forEach(v => objDir[v.key] = v.value);
              resolve({value: objDir, path});
            } else resolve(res)
          }, reject);
      } else
        reject({
          path,
          proxyPath,
          error: "not found",
          component,
          project
        })
    } catch (e) {
      reject(e)
    }
  })
}