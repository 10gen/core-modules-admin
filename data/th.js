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

var th = {
    "_files" : [{name: "filename", heading: "Filename"}, {name: "uploadDate", heading: "Upload Date"}, {name: "contentType", heading: "Content Type"}, {name: "length", heading: "Size"}, {heading: "Delete"}],
    "blog_pages" : [{heading: "Title", name: "title"},{heading: "Filename", name: "name"},{heading: "Live", name: "live"}]
};

return th[arguments[0]];
