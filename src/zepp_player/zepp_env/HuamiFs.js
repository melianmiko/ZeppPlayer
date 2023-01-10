// noinspection JSUnusedGlobalSymbols

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

import {PersistentStorage} from "../PersistentStorage.js";

const CONSTANT_FOLDER = 1;

export default class HuamiFsMock {
    O_RDONLY = 0;
    O_WRONLY = 0;
    O_RDWR = 0;
    O_APPEND = 1; // auto-seek to end
    O_CREAT = 2;
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

        this.vfsPrefix = "/storage/js_" + type + "s/" + id + "/";
        this.vfs = runtime.vfs;
    }

    getFile(path) {
        if(!this.vfs[path]) {
            // Folder search
            for(let key in this.vfs) {
                if(key.startsWith(path + "/"))
                    return CONSTANT_FOLDER;
            }
        }
        return this.vfs[path];
    }

    parsePath(path) {
        const normalize = require('path-normalize')
        if(path[0] !== "/")
            path = this.vfsPrefix + "assets/" + path;

        return normalize(path);
    }

    newFile(path) {
        const data = new ArrayBuffer(0);
        this.vfs[path] = data;

        return data;
    }

    stat(path) {
        path = this.parsePath(path);
        console.log(path);

        const file = this.getFile(path);
        if(!file) return [null, -1];

        console.log(path, file, file === CONSTANT_FOLDER);

        return [{
            mode: (file !== CONSTANT_FOLDER ? 32768 : 16384) + 511,
            size: file === CONSTANT_FOLDER ? 0 : file.byteLength,
            mtime: Date.now()
        }, 0];
    }

    stat_asset(path) {
        return this.stat(path);
    }

    open(path, flag) {
        path = this.parsePath(path);
        let f = this.getFile(path);
        if(!f && (flag & 2) !== 0) {
            f = this.newFile(path);
        }

        return {data: f, flag, path, position: flag === 1 ? f.length : 0, store: "appFs"};
    }

    open_asset(path, flag) {
        return this.open(path, flag);
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
        const {data, position} = file;
        if(position + len > data.byteLength) {
            const newBuffer = new ArrayBuffer(position + len);
            new Uint8Array(newBuffer).set(new Uint8Array(file.data));
            file.data = newBuffer;
            this.vfs[file.path] = newBuffer;
        }

        const fileView = new Uint8Array(file.data);
        for(let i = 0; i < len; i++) {
            fileView[position + i] = view[buffOffset + i]
        }

        file.position += len;
        return 0;
    }

    remove(path) {
        delete this.vfs[path];
        return 0;
    }

    rename(path, dest) {
        const data = PersistentStorage.get('fs', path);
        PersistentStorage.set("fs", dest, data);
        PersistentStorage.del("fs", path);
        return 0;
    }

    mkdir() {
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
