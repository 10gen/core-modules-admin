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

admin.MAX_HISTORY_LENGTH = 40;

core.db.dbutil();

admin.data.ShellSession = function(user){
    this.modeHistory_bash = new admin.data.ShellSession.History();
    this.modeHistory_js = new admin.data.ShellSession.History();

    // DBRef to db.users
    this.user = user || null;

    // string
    this.mode = mode;
};

db.shell.sessions.setConstructor(admin.data.ShellSession);
dbutil.associate(admin.data.ShellSession, db.shell.sessions);

admin.data.ShellSession.prototype.push = function(mode, input, output){
    var history = this.get(mode, true);
    history.push(input, output);
};

Object.extend(admin.data.ShellSession.prototype, {
    get: function(mode, create){
        if(this['modeHistory_'+mode])
            return this['modeHistory_'+mode];
        if(! create)
            return null;
        this['modeHistory_'+mode] = new admin.data.ShellSession.History();
        return this['modeHistory_'+mode];
    },

    getCommands : function(mode){
        mode = mode || 'js';
        var history = this.get(mode);
        if(history)
            return history.commands.map(Ext.pluck('input'));
        return [];
    },
    getResults : function(mode){
        mode = mode || 'js';
        var history = this.get(mode);
        if(history)
            return history.commands.map(Ext.pluck('output'));
        return [];
    },

    postload: function(){
        if(this.commands){
            this.modeHistories.js.commands = this.commands;
            delete this.commands;
        }
    }

});

admin.data.ShellSession.Command = function(input, output){
    this.input = input || "";
    // Results objects stored as as JSON strings.
    // We can't store results themselves, because results objects often have
    // DBRefs. If we reload those DBRefs, the objects themselves will change.
    this.output = output || "";
    this.timestamp = new Date();
};

admin.data.ShellSession.History = function(){
    // Array of commands.
    this.commands = [];
    this.commands._dbCons = admin.data.ShellSession.Commmand;
};

Object.extend(admin.data.ShellSession.History.prototype, {
    presave: function(){
        if(this.commands.length > admin.MAX_HISTORY_LENGTH){
            this.commands.splice(0, this.commands.length - admin.MAX_HISTORY_LENGTH);
        }
    },

    push: function(input, output){
        this.commands.push(new admin.data.ShellSession.Command(input, output));
    },
});
