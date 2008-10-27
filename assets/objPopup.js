
/**
*      Copyright (C) 2008 10gen Inc.
*  
*    Licensed under the Apache License, Version 2.0 (the "License");
*    you may not use this file except in compliance with the License.
*    You may obtain a copy of the License at
*  
*       http://www.apache.org/licenses/LICENSE-2.0
*  
*    Unless required by applicable law or agreed to in writing, software
*    distributed under the License is distributed on an "AS IS" BASIS,
*    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*    See the License for the specific language governing permissions and
*    limitations under the License.
*/

function fnCallback(e) {
    target = e.target ? e.target : e.srcElement;
    if(target.className != "partialText" )
        return;

    if(e.ctrlKey == false) {
        var divs = YAHOO.util.Dom.getElementsByClassName("fullText");
        for(var i=0; i<divs.length; i++) {
            divs[i].style.display = "none";
        }
    }
    if(YAHOO.util.Dom.getNextSibling(target))
        YAHOO.util.Dom.getNextSibling(target).style.display = "block";
}

if( document.addEventListener ) {
    document.getElementById("myCollection").addEventListener('click', fnCallback, false);
}
else {
    document.getElementById("myCollection").attachEvent( 'onclick', fnCallback, false );
}

