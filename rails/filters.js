
// ------------
//     utils
// -------------

var getFilterOptions = function( lst ){
    if ( ! ( lst && lst.length ) )
        return {};

    var options = {};
    if ( isObject( lst[ lst.length - 1 ] ) )
        options = lst.pop();
    
    return options;
}

// ------------
//     filter object
// -------------

Rails.Filter = function( filter , options ){
    this.filter = filter;
    this.options = options || {};
}

Rails.Filter.prototype.skip = function( route ){
    if ( this.options.except && this.options.except.contains( route.action ) )
        return true;
    
    if ( this.options.only && ! this.options.only.contains( route.action ) )
        return true;
    
    return false;
}

Rails.Filter.prototype.toString = function(){
    return this.filter;
}

// ------------
//     setup
// -------------


before_filter = function(){
    this._addFilters( "beforeFilters" , arguments );
};

around_filter = function(){
    this._addFilters( "aroundFilters" , arguments );
};

after_filter = function(){
    this._addFilters( "afterFilters" , arguments );
};

ActionController.Base.prototype._addFilters = function( name , args ){

    options = getFilterOptions( args );
    
    if ( ! this.keySet().contains( name ) ){
        var old = this[name];
        this[name] = [];
        this[name]._prev = old;
    }
    
    for ( var i=0; i<args.length; i++ ){
        var f = new Rails.Filter( args[i] , options );
        log.rails.init[name].info( "added [" + f + "]" );
        this[name].add( f );
    }
};

// ------------
//     exec
// -------------

ActionController.Base.prototype._before = function( appResponse ){
    this._applyFilters( appResponse , this.beforeFilters );
    this._applyFilters( appResponse , this.aroundFilters );
}

ActionController.Base.prototype._applyFilters = function( appResponse , filters ){
    if ( ! filters )
        return;
    
    var a = filters;
    
    while ( a ){
        for ( var i=0; i<a.length; i++ ){
            var filter = a[i];
            var name = filter.filter;
            var options = filter.options;
            var f = a[i];
            
            log.rails.filters[this.shortName].info( "running filter [" + filter + "]" );
            
            if ( isString( name ) ){
                f = appResponse.requestThis[name];
            }
            
            if ( ! isFunction( f ) ){
                SYSOUT( "skipping filter [" + filter + "] " );
                continue;
            }
            
            if ( filter.skip( matchingRoute ) )
                continue;

            f.call( appResponse.requestThis );
        }
        a = a._prev;
    }

}
