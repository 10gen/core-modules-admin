
Rails.idRegex = /[0-9a-fA-F]{24}/;

ActionController = {};

ActionController.Routing = {};

ActionController.Routing.Routes = function(){
    this.il = log.rails.init.routes;
    this._routes = [];
};

// --------------------------
// ---  internal objects -----
// --------------------------

var RailsURI = function( uri ){
    this.uri = uri;
    uri = uri.replace( /^\/+/ , "" );
    this.pieces = uri.split( "[/\.]+" );
};

Rails.Route = function(){
    this.controller = null;
    this.action = "index";
};

var RailsRoute = function( uri , options ){
    this.uri = uri;
    this.ruri = new RailsURI( uri );
    this.options = options;
};

RailsRoute.prototype.match = function( request , other ){
    if ( ! ( other && other instanceof RailsURI ) )
        return null;

    var method = request._method;
    if ( ! method )
        method = request.getMethod();

    method = method.toUpperCase();

    if ( this.options && 
         this.options.method &&
         this.options.method != method )
        return null;

    if ( other.pieces.length > this.ruri.pieces.length )
        return null;
    
    var theRoute = new Rails.Route();
    if ( this.options )
        for ( var foo in this.options )
            theRoute[foo] = this.options[foo];
    
    var max = this.ruri.pieces.length;
    for ( var i=0; i<max; i++ ){
        
        var shouldbe = this.ruri.pieces[i];
        var actuallyIs = other.pieces[i];
        
        if ( ! shouldbe.startsWith( ":" ) ){
            // this means it has to actually match
            if ( shouldbe != actuallyIs ){
            }
            continue;
        }
        
        var name = shouldbe.substring(1);
        if ( actuallyIs )
            theRoute[ name ] = actuallyIs;

        if ( this.options ){
            if ( this.options[name] instanceof RegExp ){
                if ( ! ( actuallyIs && this.options[name].matches( actuallyIs ) ) )
                    return null;
            }
        }
        
    }

    return theRoute;
};

RailsRoute.prototype.toString = function(){
    return " { " + this.uri + " " + tojson( this.options ) + " } ";
};

// --------------------------
// ---  setup callbacks -----
// --------------------------

ActionController.Routing.Routes.prototype.connect = function( r , options ){
    this.il.info( "connect : " + r  + " options [ " + tojson( options ) + "]" );
    this._routes.push( new RailsRoute( r , options ) );
};

/**
* methods
* - index -
* - show *
* - new - 
* - edit
* - create *
* - update
* - destroy
*/
ActionController.Routing.Routes.prototype.resources = function( r ){
    var singularName = r.substring( 0 , r.length - 1 );

    this.il.info( "resources : " + r + " [" + singularName + "]" );
    

    globals.putExplicit( r + "_path" , "/" + r );
    globals.putExplicit( r + "_url" , "/" + r );

    // new
    globals.putExplicit( "new_" + singularName + "_path" , "/" + r + "/new2" );

    // create
    this.connect( "/" + r , { controller : r , 
                              method : "POST" , 
                              action: "create" } );

    // delete
    this.connect( "/" + r + "/:id" , { controller : r , 
                                       method : "DELETE" , 
                                       action: "destroy" } );

    // update
    this.connect( "/" + r + "/:id" , { controller : r , 
                                       method : "POST" , 
                                       action: "update" } );


    // edit
    this.connect( "/" + r + "/:id/edit" , { controller : r , 
                                            action : "edit" ,
                                            id : Rails.idRegex
                                          } );
    
    globals.putExplicit( "edit_" + singularName + "_path" , 
                         function( obj ){
                             if ( ! obj )
                                 return scope[ "new_" + singularName + "_path" ];
                             return "/" + r + "/" + obj._id + "/edit";
                         } 
                       );
                         
    // show
    this.connect( "/" + r + "/:id" , { controller : r , 
                                       method : "GET" , 
                                       action : "show" ,
                                       id : Rails.idRegex
                                     } );
    
};


// --------------------------
// ---  main  callback  -----
// --------------------------

ActionController.Routing.Routes.draw = function( f ){
    f( Rails.routes );
};

// --------------------------
// ---  runtime  -----
// --------------------------

ActionController.Routing.Routes.prototype.find = function( request ){
    var state = new RailsURI( request.getURI() );
    for ( var i=0; i<this._routes.length; i++){
        var route = this._routes[i];
        var theRoute = route.match( request , state );
        if ( ! theRoute )
            continue;
        return theRoute;
    }
    return null;
};


ActionController.Routing.Routes.prototype.getLinkFor = function( thing ){
    
    if ( ! thing )
        throw "can't link to null";

    if ( isString( thing ) )
        return thing;
    
    if ( thing.collectionName )
        return "/" + thing.collectionName + "s/" + thing._id;

};
