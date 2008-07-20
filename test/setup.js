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

db = connect('admin'); // I guess this should be done by the framework?

core.user.user();
u = new User();
u.name = "Test User";
u.email = "test@10gen.com";
u.setPassword("test");
u.addPermission('admin');

db.users.save(u);

u2 = new User();
u2.name = "Not Admin";
u2.email = "notadmin@10gen.com";
u2.setPassword("notadmin");

db.users.save(u2);


db.mycollection.save({a: 4});
db.mycollection.save({a: {b: 5}});
