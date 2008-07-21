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

core.core.file();
core.git.repo();

admin.data.Bash = function(){
    this._pwd = "/";
};

Object.extend(admin.data.Bash.prototype, {

    getCmdArray : function() {
        return ['ls', 'dir', 'rm', 'mv', 'cp', 'git', 'diff', 'cat', 'head', 'tail', 'date', 'grep', 'pwd', 'help', 'cd'];
    },

    handle: function(cmd, files){
        var commands = this.getCmdArray();
        assert(commands.contains(cmd));
        files = files || [];
        this._validate(files);
        cmd = cmd + " " + files.join(' ');
        log.admin.data.bash.debug(cmd);
        var foo = sysexec(cmd, "", {}, this._pwd);

        return foo;
    },

    _validate: function(files){
        for(var i = 0; i < files.length; i++){
            if(files[i].trim().startsWith('-')) continue;
            if(files[i].trim().startsWith('/'))
                throw ("illegal absolute path: "+ files[i]);

            if(files[i].trim().split('/').contains('..'))
                throw ("paths with '..' are not allowed except in cd");
        }

    },
    cd: function(dir){
        assert(dir.length == 1);
        dir = dir[0];
        var t = this;
        var oldpwd = this._pwd;
        dir.split('/').forEach(function(z){
            if(! z) return;

            if(z == '..'){
                log.admin.data.bash.debug("old pwd " + t._pwd);
                if(t._pwd == "/")
                    return {out :"", err:""};
                else {
                    t._pwd = t._pwd.replace(/[^\/]*$/, '').replace(/\/$/, '');
                    if(t._pwd == "") t._pwd = '/';
                }
                log.admin.data.bash.debug("new pwd " + t._pwd);
            }
            else {
                if(t._pwd && t._pwd[t._pwd.length-1] != '/')
                    t._pwd += '/';
                t._pwd += z;
            }
        });
        var err;
        if(!File.open(this._pwd).exists()){
            err = "cd: The path " + dir + " does not exist.";
        }
        else if(!File.open(this._pwd).isDirectory()){
            err = "cd: The path " + dir + " is not a directory.";
        }

        if(err){
            this._pwd = oldpwd;
            return {out: "", err: err};
        }

        return {out: "", err: ""};
    },

    ls: function(files){
        return this.handle('ls', files);
    },
    dir: function(files){
        return this.ls(files);
    },
    rm: function(files){
        return this.handle('rm', files);
    },
    mv: function(files){
        return this.handle('mv', files);
    },
    cp: function(files){
        return this.handle('cp', files);
    },
    git: function(files){
        var cmd = files ? files[0] : "";
        files = files.slice(1) || [];
        this._validate(files);
        var env = git.Repo.getEnv(user);

        var foo = sysexec('git ' + cmd + ' ' + files.join(' '), "", env);

        return foo;
    },
    diff: function(files){
        return this.handle('diff', files);
    },
    cat: function(files){
        return this.handle('cat', files);
    },
    head: function(files){
        return this.handle('head', files);
    },
    tail: function(files){
        return this.handle('tail', files);
    },
    date: function(files){
        return this.handle('date', files);
    },
    grep: function(files){
        return this.handle('grep', files);
    },
    pwd: function(files){
        return {out: this._pwd + '\n', err: ""};
    },
    help: function(files){
        return {out: Ext.asString(adminRoot.data.bash_help) + '\n', err: ""};
    },
});

log.admin.data.bash.level = log.LEVEL.ERROR;
