
register = new djang10.Library();

register.filter( "select" , 
                 function( choices , name , selected ){
                     var html = "";
                     
                     html += "<select name='" + name + "'>";
                     html += "<option>--none--</option>";
                     for ( var i=0; i<choices.length; i++ ){
                         html += "<option value='" + choices[i] + "' ";
                         if ( choices[i] == selected )
                             html += " selected ";
                         html += " >" + choices[i] + "</option>";
                     }
                     html += "</select>";
                     return html;
                 }
               );


