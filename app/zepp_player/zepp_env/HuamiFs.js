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
        const f = this.player.getAssetText(path);
        return [{
            size: f.length,
            mtime: 0 // no access
        }, 0];
    }

    open(path, flag) {
        let f = PersistentStorage.get("fs", path);
        if(!f) f = "";
        return {data: f, flag, path, position: 0, store: "fs"};
    }

    open_asset(path, flag) {
        let f = this.player.getAssetText(path);
        if(!f) f = "";
        return {data: f, flag, path, position: flag == 1 ? f.length : 0, store: "appFs"};
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
        const {data, position} = file;

        console.log("read", file.path, "to", buffOffset, "from", position, "len", len);
        for(var i = 0; i < len; i++) {
            view[buffOffset + i] = data.charCodeAt(position + i);
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
