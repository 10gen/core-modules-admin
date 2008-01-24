
function mapUrlToJxpFileCore( uri , request ){
    var ua = request.getHeader( "User-Agent" );
    
    if ( ua && 
         ( ua.match( /webdav/i )
           || ua.match( /Microsoft Data Access Internet Publishing Provider DAV/ )
           || ua.match( /Microsoft Data Access Internet Publishing Provider Protocol Discovery/ )
           )
         ){
        return "/~~/webdav.jxp";
    }
    
};