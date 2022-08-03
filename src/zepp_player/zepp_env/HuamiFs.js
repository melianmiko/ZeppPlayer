/*
    ZeppPlayer - ZeppOS, mostly Mi Band 7, simulator for PC
    Copyright (C) 2022  MelianMiko

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { PersistentStorage } from "../PersistentStorage.js";
import normalize from "path-normalize";

export default class HuamiFsMock {
    O_RDONLY = 0;
    O_WRONLY = 0;
    O_RDWR = 0;
    O_APPEND = 1; // auto-seek to end
    O_CREAT = 0;
    O_EXCL = 0;
    O_TRUNC = 0;

    SEEK_SET = 0;

    constructor(runtime) {
        this.runtime = runtime;

        const setters = ["SysProSetBool", "SysProSetInt64", "SysProSetDouble", "SysProSetChars"];
        const getters = ["SysProGetBool", "SysProGetInt64", "SysProGetDouble", "SysProGetChars"];

        for(let a in setters) this[setters[a]] = this.SysProSetInt;
        for(let a in getters) this[getters[a]] = this.SysProGetInt;

        const id = runtime.appConfig.app.appId.toString(16).padStart(8, "0").toUpperCase();
        const type = runtime.appConfig.app.appType;
        const realPrefix = runtime.path_project + "/";
        const vfsPrefix = "/storage/js_" + type + "s/" + id + "/";

        this.vfs = {};
        this.vfsPrefix = vfsPrefix;
        for(let i in runtime.readCache) {
            const newPath = i.replace(realPrefix, vfsPrefix);
            this.vfs[newPath] = runtime.readCache[i];
        }
    }

    getFile(path) {
        const normalize = require('path-normalize')

        if(path[0] !== "/")
            path = this.vfsPrefix + "assets/" + path;

        const newPath = normalize(path);
        return this.vfs[newPath]
    }

    stat(path) {
        let f = this.getFile(path);

        return [{
            mode: (f ? 32768 : 16384) + 511,
            size: f ? f.byteLength : 0,
            mtime: Date.now()
        }, 0];
    }

    stat_asset(path) {
        return this.stat(path);
    }

    open(path, flag) {
        let f = this.getFile(path);
        return {data: f, flag, path, position: flag === 1 ? f.length : 0, store: "appFs"};
    }

    open_asset(path, flag) {
        let f = this.getFile(path);
        return {data: f, flag, path, position: flag === 1 ? f.length : 0, store: "appFs"};
    }

    seek(file, pos) {
        file.position = pos;
    }

    read(file, buffer, buffOffset, len) {
        const view = new Uint8Array(buffer);
        const {position} = file;
        const fileView = new Uint8Array(file.data);

        for(let i = 0; i < len; i++) {
            view[buffOffset + i] = fileView[position + i];
        }

        file.position += len;
        return 0;
    }

    close() {
        return 0;
    }

    write(file, buf, buffOffset, len) {
        const view = new Uint8Array(buf);
        const {data, position, store, path} = file;
        let newData = data.substring(0, position);

        for(var i = 0; i < len; i++) {
            newData += String.fromCharCode(view[buffOffset + i]);
        }
        newData += data.substring(position + len);

        PersistentStorage.set(store, path, newData);
        file.position += len;

        return 0;
    }

    remove(path) {
        PersistentStorage.del("fs", path);
        return 0;
    }

    rename(path, dest) {
        const data = PersistentStorage.get('fs', path);
        PersistentStorage.set("fs", dest, data);
        PersistentStorage.del("fs", path);
        return 0;
    }

    mkdir(path) {
        // Nothing to do
        return 0;
    }

    readdir(path) {
        const normalize = require('path-normalize');
        path = normalize(path);

        let content = [];
        if(path[path.length-1] !== "/" && path !== "") path += "/";

        for(let a in this.vfs) {
            if(a.startsWith(path)) {
                const fn = a.substring(path.length).split("/")[0];
                if(content.indexOf(fn) < 0) content.push(fn);
            }
        }

        return [content, 0];
    }

    SysProGetInt(key) {
        return PersistentStorage.get("SysProRegistery", key);
    }

    SysProSetInt(key, val) {
        PersistentStorage.set("SysProRegistery", key, val);
    }
}
