async function copy(path,newPath,move = false){
    path = path ?
        path[0] == "/" ? path : "/" + path :
        "";
    newPath = newPath ?
    newPath[0] == "/" ? newPath : "/" + newPath :
    "";
    await swStart();
    var splitPath = path.split("/");
    var resourceName = splitPath.pop();
    //newPath = newPath ? newPath + "/" + resourceName : resourceName;
    var isdir = await isDir(path);
    if (isdir){
        await update(newPath);
        var pathsToDelete = [];
        pathsToDelete.push(path);
        var dirFiles = await getFiles(path);
        dirFiles.sort((b, a)=>{ // sort from the superficial one to the deep level
            return b.path.split("/").length - a.path.split("/").length ;
        });
        for(var i = 0;i<dirFiles.length;i++){
            var file = dirFiles[i];
            var newRelativePath = file.path.replace(path,newPath);
            var wasThisPathADir = await isDir(file.path);
            var value = null;
            if(!wasThisPathADir) {
                var filePath = file.path[0] == "/" ? file.path : "/" + file.path;
                var bodyReq = await caches.match(CACHEPATH + tilepieces.currentProject + filePath);
                value = await bodyReq.blob();
            }
            await update(newRelativePath,value);
            move && pathsToDelete.push(file.path);
        }
        if(move)
            for(var p=0;p<pathsToDelete.length;p++)
                await del(pathsToDelete[p]);
    } // file case
    else{
        await update(newPath,await read(path));
        if(move)
            await del(path);
    }
    if(move){
        var parentDirectory = splitPath.length ? "/" + splitPath.join("/") : "";
        var parentDirectoryRes = await read(parentDirectory);
        var parentDirectoryData = parentDirectoryRes.value;
        delete parentDirectoryData[resourceName];
        var newParentDirectory = new Blob([JSON.stringify(parentDirectoryData)], {type: 'application/json'});
        var cache = await caches.open(CACHEFILES);
        await cache.put(CACHEPATH + tilepieces.currentProject + parentDirectory.replace(/\/\//g,"/"),
            new Response(newParentDirectory));
    }
    return {
        path:newPath,
        result:1
    }
}