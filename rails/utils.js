

Rails.getRubyFilesFromDir = function( name ){
    var dir = openFile( name );
    if ( ! dir.exists() )
        return [];
    
    var all = [];
    dir.listFiles().forEach( 
        function(z){

            if ( ! z.filename.endsWith( ".rb" ) )
                return;

            if ( z.filename.startsWith( "." ) )
                return;
            
            var o = {};
            
            o.filename = z.filename;
            o.shortName = z.filename.replace( /\.rb$/ , "" );
            
            var path = name + "/" + o.shortName;
            o.func = local.getFromPath( path );
            assert( o.func , o.shortName );

            all.add( o );
        }
    );
    return all;
}

Rails.loadSymbols = function( func ){
    var before = scope.keySet();
    scope.setGlobal( true );
    func.call();
    var after = scope.keySet();
    
    var s = {};

    for ( var i=0; i<after.length; i++ ){
        var name = after[i];
        if ( before.contains( name ) )
            continue;
        s[name] = scope[ name ];
    }
    
    return s;
}

Rails.loadPlugins = function( gl , path ){
    var d = openFile( path );
    if ( ! d.exists() )
        return;

    var l = log.rails.init.plugins.info;

    d.listFiles().forEach(
        function(z){
            var theirLib = path + "/" + z.filename + "/lib";
            Ruby.libPath.push( theirLib );
            l( "added [" + z.filename + "]" );

            var init = local.getFromPath( path + "/" + z.filename + "/init" );
            if ( init ){
                l( "running init [" + z.filename + "]" );
                init();
                l( "done running init [" + z.filename + "]" );
            }
        }
    );
}


function alias_method( n , o ){
    this[n] = this[o];
}