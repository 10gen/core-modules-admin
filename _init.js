if(! allowModule && siteScope){
    allowModule = siteScope.allowModule;
}

if(! version && siteScope){
    version = siteScope.version;
}

if(! routes && siteScope){
    routes = siteScope.routes;
}

adminRoot = core.modules.admin;
assert( adminRoot );
admin = {};

log.admin.level = log.LEVEL.ERROR;

admin.getAppNav = function(key){
    var appNav;
    // Check core.modules first because we don't want to mistakenly load
    // a file. We can't yet check core.isLoaded(key) or core.app.isLoaded(key)
    // so let's check the safe ones before we check if we can load old ones
    // from corejs.
    if(core.modules.isLoaded(key)){
        if(core.modules[key] && core.modules[key].admin && core.modules[key].admin.leftNav)
                appNav = core.modules[key].admin.leftNav;
    }
    else if(local.modules.isLoaded(key)){
        if(local.modules[key] && local.modules[key].admin && local.modules[key].admin.leftNav)
            appNav = local.modules[key].admin.leftNav;
    }
    else if(core[key]){
        if(core[key].admin && core[key].admin.leftNav) appNav = core[key].admin.leftNav;
    }
    else if(core.app && core.app[key]){
        if(core.app[key].admin && core.app[key].admin.leftNav) appNav = core.app[key].admin.leftNav;
    }

    if (!appNav) appNav = function(){ log.admin.debug("Can't get nav tree for application " + key); return{tree: [], reverse: []}; };
    appNav = appNav();
    return appNav;
};

admin.getRoles = function(url){
    var allRoles = (allowModule && allowModule.admin ) ? allowModule.admin.permissions.getRoles(url).toArray() : [] ;
    var rolesMap = {};
    allRoles.forEach(function(z){
        rolesMap[z.name] = true;
    });
    if(! rolesMap.admin){
        rolesMap.admin = true;
        allRoles.push({name: 'admin'});
    }
    return allRoles;
};

globalHead.add( "<link rel=\"shortcut icon\" href=\"http://static.10gen.com/www.10gen.com/assets/images/favicon.ico?lm=1216647467000\">" );
