
// this is what starts rails


Rails.models = [];

var modelsDir = openFile("app/models" );
if ( modelsDir.exists() ){
    
    modelsDir.listFiles().forEach( 
        function(z){

            if ( ! z.filename.endsWith( ".rb" ) ) 
                return;
            
            var f = local.app.models[ z.filename.replace( /\.rb$/ , "" ) ];

            var before = scope.keySet();
            
            scope.setGlobal( true );
            f();
            scope.setGlobal( false );

            var after = scope.keySet();
            
            for ( var i=0; i<after.length; i++){
                var name = after[i];
                if ( before.contains( name ) )
                    continue;
                
                var model = scope[ name ];
                if ( ! ( model && model._isModel ) )
                    continue;
                
                model.setFile( z.filename );

                Rails.models.add( model );
                globals.getParent().putExplicit( name , model );
                
                log.rails.init.model.info( "added:" + name + " : " + model );
            }
        }
    )
    
};


var controllersDir = openFile("app/controllers" );
if ( ! controllersDir.exists() )
    throw "you need an app/controllers directory";

Rails.controllers = [];

controllersDir.listFiles().forEach( 
    function(z){
        
        if ( ! z.filename.endsWith( "_controller.rb" ) )
            return;
        
        var f = local.app.controllers[ z.filename.replace( /\.rb$/ , "" ) ];
        
        scope.setGlobal( true );
        f();

        var shortName = z.filename.replace( /_controller.rb$/ , "" );
        var className = shortName.substring( 0 , 1 ).toUpperCase() + shortName.substring( 1 ) + "Controller";
        
        var c = scope[className];
        assert( c );
        assert( c.__magic == 17 );
        
        c.shortName = shortName;
        c.className = className;
        
        Rails.controllers.add( scope[className] );

        log.rails.init.controller.info( "added: " + className );
    }

);
