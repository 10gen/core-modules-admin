
core.ui.chart.datetime();

function doRound( date , t ){
    if ( t == "h" )
        return date.roundHour();
    if ( t == "d" )
        return date.roundDay();
    if ( t == "w" )
        return date.roundWeek();
    if ( t == "m" )
        return date.roundMonth();
    return date.roundMinutes( 5 );
}


function getTotalByteArray(cursor, t,min) {
    cursor.sort( { ts : 1 } );

    var lastTS = null;
    var a = [];

    var last = null;

    cursor.forEach( function( z ){
	    //assert( lastTS == null || lastTS <= z.ts );
	    if (z === null) {
	        return;
	    }
	    lastTS = z.ts;

            var n = doRound( z.ts , t );

            if ( ! last || ( n.getTime() != last.getTime()  ) )
                a.push( { time : n , num : 0 } );

            a[a.length - 1 ].num += z.num;
            last = n;
        } );

    if (a.length === 0) {
        return [];
    }

    if ( min ){
	while ( a.length < min ){
	    a.unshift( { time : new Date( a[0].time.getTime() - ( 1000 * 60 * getMinutes( t ) ) ) , num : 0 } );
	}
    }

    return a;
};


function getMinutes( t ){
    if ( t == "h" )
	return 60;

    if ( t == "d" )
	return  60 * 24;

    if ( t == "w" )
	return  60 * 24 * 7;

    if ( t == "m" )
	return 60 * 24 * 30;

    return 5;
};

/**
 * @return [ { time : Date , num : Number } ... ]
*/
function mungeData( cursor , t , startTime ){
    var a = getTotalByteArray(cursor, t);

    var minutes = getMinutes( t );

    // convert sums to per second
    a = a.map( function( z ){
		   return { time : z.time , num : z.num / ( minutes * 60 ) };
	       } );

    var msDiff = minutes * 60 * 1000;

    if ( a.length == 0 ) return [];

    while ( a[0].time.getTime() > ( startTime.getTime() + 5000 ) ){
        var d = new Date( a[0].time.getTime() - msDiff );
        a.unshift( { time : d , num : 0 } );
    }

    var n = [];
    for ( var i=0; i<a.length; i++ ){
	if ( i == 0 ){
	    n.push( a[i] );
	    continue;
	}

	var cur = a[i-1].time;
	while ( ( cur.getTime() + msDiff + 5000  ) < a[i].time.getTime() ){
	    cur = new Date( cur.getTime() + msDiff );
	    a.push( { time : cur , num : 0 } );
	}

	n.push( a[i] );
    }
    a = n;
    return a;

}

/**
 * @param limit 5 minute chunks to go back
 */
function go( type , limit , t , header ){
    // we have to multiply by 1000 by adding "000" and parsing, or it will overflow
    var lim = parseInt((limit*5*60)+"000");
    var dt = new ui.chart.DateTime();

    var now = new Date();
    var start = new Date( now.getTime() - ( lim ) );
    start = doRound( start , t );

    var coll = db._system.usage[type];
    coll.ensureIndex( { ts : 1 } );

    data = mungeData( coll.find( { ts : { $gte: start } } ) , t , start );

    data.forEach( function( z ){
		      dt.add( z.time , z.num  );
		  } );
    dt.width = 500;
    dt.height = 100;
    print( "<h3>" + ( header || type ) + "</h3>" );
    dt.print( print );
}

var types = [ "bytes_in" , "bytes_out" , "cpu_millis" , "requests" ];
function doAllTypes( limit , t ){
    types.forEach( function(z){
		       go( z , limit , t );
		   } );

}


function formatBytes(bytes) {

    if ( ! bytes )
	return "0 bytes";

    suffix = [" bytes", " KB", " MB", "GB", " TB", " PB", " EB", " ZB", " YB"];
    var i = 0;
    while( bytes >= 10000 ) {
	bytes = bytes / 1000;
	i++;
    }
    return bytes.toFixed(2) + suffix[i];
}

function formatMillis(millis) {
    if(millis/(1000*60*60) > 0)
	return (millis/(1000*60*60)).toFixed(2) + " hours";
    if(millis/(1000*60) > 0)
	return (millis/(1000*60)).toFixed(2) + " minutes";
    if(millis/(1000) > 0)
	return (millis/(1000)).toFixed(2) + " seconds";
    return millis + " ms";
}


function threeMonthSummary(limit, t) {

    limit = parseInt( limit );
    data_i = getTotalByteArray( db._system.usage.bytes_in.find().limit( limit ) , t , 3 ).reverse();
    data_o = getTotalByteArray( db._system.usage.bytes_out.find().limit( limit ) , t , 3 ).reverse();
    millis = getTotalByteArray( db._system.usage.cpu_millis.find().limit( limit ) , t , 3 ).reverse();


    var sum = [];
    var i = 0;
    total = { b_in : 0, b_out: 0, io : 0, millis: 0 };

    data_i.forEach( function( b_in ){ sum[i++] = b_in.num; } );
    i = 0;
    data_o.forEach( function( b_out ){ sum[i++] += b_out.num; } );

    var m_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var start = new Date();
    var month = start.getMonth();

    var th = [{name: "Month"}, {name: "Bytes In"}, {name:"Bytes Out"}, {name:"Total Bytes"}, {name: "CPU Milliseconds"}];

    var table = {rows: []};
    for(i = 0;  i<3; i++) {
	m_index =  (month-1-i < 0) ? ( month + (12 - (i+1)) ) : (month - 1 - i);
        table.rows[i] = [];
	table.rows[i].push(m_names[m_index]);

	// so... if there is data for the month, check that the month doesn't wrap around to the previous year (month-1-i >= 0)
	// ("month" starts at 1:January and goes to 12:December)
	// if it "crosses" the year, it is (month+(12-(i+1))), otherwise it is just month-1-i.

	if(i<sum.length) {
	    table.rows[i].push(formatBytes(data_i[i].num));
	    table.rows[i].push(formatBytes(data_o[i].num));
	    table.rows[i].push(formatBytes(sum[i]));
	    table.rows[i].push(formatMillis(millis[i].num));

	    total.b_in += data_i[i].num;
	    total.b_out += data_o[i].num;
	    total.io += sum[i];
	    total.millis += millis[i].num;
	}
	else {
	    table.rows[i].push("0 bytes");
	    table.rows[i].push("0 bytes");
	    table.rows[i].push("0 bytes");
	    table.rows[i].push("0 ms");
	}
    }
    table.rows[3] = [];
    table.rows[3].push("Total");
    table.rows[3].push(formatBytes(total.b_in));
    table.rows[3].push(formatBytes(total.b_out));
    table.rows[3].push(formatBytes(total.io));
    table.rows[3].push(formatMillis(total.millis));

    adminRoot.pieces.tableHeader({th: th, search: false, colspan: th.length});
    adminRoot.pieces.usageBody({th: th, table: table});
    adminRoot.pieces.tableFooter({page: [], colspan: th.length});

}

if( request.summary ) {
    threeMonthSummary( request.summary, request.div );
}
else {
    doAllTypes( parseInt( request.time ), request.div );
}

