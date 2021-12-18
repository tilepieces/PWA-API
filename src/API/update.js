async function update(path,blob,component){
    if(!tilepieces.currentProject)
        throw "[update]Invalid call: no tilepieces.project setted";
    await swStart();
    var parentDirectoryAsArray = path.split("/");
    var name = parentDirectoryAsArray.pop();
    var parentDirectory = parentDirectoryAsArray.length ? parentDirectoryAsArray.join("/") : "";
    try {
        var parentDirectoryRes = await read(parentDirectory,component);
    }
    catch(e){ // if not exists, create it
        if(e.error != "not found")
            throw e;
        for(var i = 0;i<parentDirectoryAsArray.length;i++){
            var upParentDirectory = parentDirectoryAsArray.filter((v,index)=>index<=i).join("/");
            try {
                parentDirectoryRes = await read(upParentDirectory,component);
            }
            catch(e){
                if(e.error != "not found")
                    throw e;
                parentDirectoryRes = null;
                await update(upParentDirectory,null,component)
            }
        }
    }
    if(path[0] != "/")
        path = "/" + path;
    var file,isDirectory;
    // update the resource
    if(typeof blob == "undefined" || blob === false || blob === null){
        isDirectory = true;
        file = new File(["{}"], name, {
            type: "application/json"
        });
    }
    else{
        isDirectory = false;
        file = new File([blob], name, {
            type: contentTypes[path.split(".").pop()] || "text/plain"
        });
    }
    var cache = await caches.open(CACHEFILES);
    //add directory
    parentDirectoryRes = parentDirectoryRes || await read(parentDirectory,component);
    var parentDirectoryData = parentDirectoryRes.value;
    parentDirectoryData[name] = isDirectory ? {} : name;
    var newParentDirectory = new Blob([JSON.stringify(parentDirectoryData)], {type: 'application/json'});
    parentDirectory = parentDirectory ?
        parentDirectory[0] == "/" ? parentDirectory : "/" + parentDirectory :
        "";
    if(component){
        var components = await fetch("/components.json");
        components = components ? await components.json() : {};
        var componentPath = (components[component].path.indexOf('http://') === 0 || components[component].path.indexOf('https://') === 0) ?
            components[component].path :
            slashDir(components[component].path);
    }
    var pathWhereToPut = component ? componentPath : CACHEPATH + tilepieces.currentProject;
    await cache.put(pathWhereToPut + parentDirectory.replace(/\/\//g,"/"),
        new Response(newParentDirectory));
    // add file
    var newPath = pathWhereToPut + path;
    await cache.put(newPath, new Response(file));
    window.dispatchEvent(new CustomEvent("tilepieces-file-updating",{detail:{
        path,
        isDirectory
    }}));
    return {path: newPath};
}