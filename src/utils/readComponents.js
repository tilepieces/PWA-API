async function readComponentsInner(components, startingPath = "") {
  var cacheFiles = await caches.open(CACHEFILES);
  for (var k in components) {
    var c = components[k];
    var startPath = startingPath + c.path;
    var componentPathJSON = (startPath + "/tilepieces.component.json").replace(/\/\//g, "/");
    try {
      var componentFile = await cacheFiles.match(new Request(componentPathJSON));
      var component = await componentFile.json();
    } catch (e) {
      console.error("[error on trying to read file component] ->", c.name);
      console.error(e);
      continue;
    }
    component.components = await readComponentsInner(component.components, startPath);
    components[k] = Object.assign({}, component, c);
  }
  return components;
}

async function readComponents() {
  var componentsCacheFile = await fetch("/components.json");
  var cRaw = await componentsCacheFile.json();
  return await readComponentsInner(cRaw, "");
}