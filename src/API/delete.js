async function del(path,project,component){
    project = project || tilepieces.currentProject;
    await swStart();
    var cache = await caches.open(CACHEFILES);
    var parentDirectoryAsArray = path.split("/");
    var name = parentDirectoryAsArray.pop();
    var parentDirectory = parentDirectoryAsArray.length ? parentDirectoryAsArray.join("/") : "";
    var isdir = await isDir(path,component,component ? null : project);
    if (isdir) {
        var dirFiles = await getFiles(path,component,component ? null : project);
        dirFiles.sort((a, b)=> { // sort from the deep level to the superficial one, to avoid deleting the folder the directory before its subfolders and files
            return b.path.split("/").length - a.path.split("/").length;
        });
        for (var i = 0; i < dirFiles.length; i++)
            await deletePath(cache,
                component? null : project,
                dirFiles[i].path,
                component
            )
    }
    var parentDirectoryRes = await read(parentDirectory,component,component ? null : project);
    var parentDirectoryData = parentDirectoryRes.value;
    delete parentDirectoryData[name];
    var newParentDirectory = new Blob([JSON.stringify(parentDirectoryData)], {type: 'application/json'});
    parentDirectory = parentDirectory ?
        parentDirectory[0] == "/" ? parentDirectory : "/" + parentDirectory :
        "";
    if(component){
        var components = await fetch("/components.json");
        components = components ? await components.json() : {};
        var componentPath = (components[component].path.indexOf('http://') === 0 ||
        components[component].path.indexOf('https://') === 0) ?
            components[component].path :
            slashDir(components[component].path);
    }
    var pathWhereToDelete = component ? componentPath : CACHEPATH + project;
    await cache.put(pathWhereToDelete + parentDirectory.replace(/\/\//g,"/"),
        new Response(newParentDirectory));
    await deletePath(cache, component? null : project, path,component);
    if((!path || path == "/") && !component){
        var projectsMatch = await fetch("/projects.json");
        var projectJson = await projectsMatch.json();
        var pAlreadyPresentIndex = projectJson.findIndex(v=>v.name == project);
        projectJson.splice(pAlreadyPresentIndex,1);
        var projectsBlob = new Blob([JSON.stringify(projectJson)], {type: 'application/json'});
        await cache.put("/projects.json", new Response(projectsBlob));
        var componentsMatch = await cache.match(new Request("/components.json"));
        var components = await componentsMatch.json();
        if(components[project]){
            delete components[project];
            var compsBlob = new Blob([JSON.stringify(components)], {type: 'application/json'});
            await cache.put("/components.json", new Response(compsBlob));
        }
    }
    return{path};
}