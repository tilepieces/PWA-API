function setLocalComponentsTree(componentsToExpand){
    var components = {};
    for(var name in componentsToExpand){
        var splittedName = name.split("/");
        if(!components[splittedName[0]])
            components[splittedName[0]] = componentsToExpand[splittedName[0]];
        var parent = components[splittedName[0]];
        for(var i = 1;i<splittedName.length;i++){
            if(!parent.components ||
                typeof parent.components != "object" ||
                Array.isArray(parent.components))
                parent.components = {};
            var cName = splittedName.slice(0,i+1).join("/");
            parent.components[cName] = componentsToExpand[cName];
            parent = parent.components[cName];
        }
    }
    return components;
}