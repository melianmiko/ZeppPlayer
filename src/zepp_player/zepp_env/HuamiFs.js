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

export default class HuamiFsMock {
    O_RDONLY = 0;
    O_WRONLY = 0;
    O_RDWR = 0;
    O_APPEND = 1; // auto-seek to end
    O_CREAT = 0;
    O_EXCL = 0;
    O_TRUNC = 0;

    SEEK_SET = 0;

    constructor(player) {
        this.player = player;

        const setters = ["SysProSetBool", "SysProSetInt64", "SysProSetDouble", "SysProSetChars"];
        const getters = ["SysProGetBool", "SysProGetInt64", "SysProGetDouble", "SysProGetChars"];

        for(var a in setters) this[setters[a]] = this.SysProSetInt;
        for(var a in getters) this[getters[a]] = this.SysProGetInt;
    }

    stat_asset(path) {
        console.log("stat", path);
        let f = this.player.readCache[this.player.getAssetPath(path)];
        return [{
            size: f.byteLength,
            mtime: 0 // no access
        }, 0];
    }

    open(path, flag) {
        let f = PersistentStorage.get("fs", path);
        if(!f) f = "";
        return {data: f, flag, path, position: 0, store: "fs"};
    }

    open_asset(path, flag) {
        let f = this.player.readCache[this.player.getAssetPath(path)];
        return {data: f, flag, path, position: flag === 1 ? f.length : 0, store: "appFs"};
    }

    stat(path) {
        const f = PersistentStorage.get("fs", path);

        if(!f) return [{}, 1];
        return [{
            size: f.length,
            mtime: Date.now()
        }, 0];
    }

    seek(file, pos) {
        console.log("seek", file.path, "to", pos);
        file.position = pos;
    }

    read(file, buffer, buffOffset, len) {
        const view = new Uint8Array(buffer);
        const {position} = file;
        const fileView = new Uint8Array(file.data);

        console.log("read", file.path, "to", buffOffset, "from", position, "len", len);
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
        let content = [];
        if(path[path.length-1] != "/") path += "/";

        const keys = PersistentStorage.keys("fs");
        for(var a in keys) {
            if(keys[a].startsWith(path)) {
                const fn = keys[a].substring(path.length).split("/")[0];
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
