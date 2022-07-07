export class PersistentStorage {
    static get(group, key) {
        let data = PersistentStorage._getStorage();
        if(!data[group]) return null;
        return data[group][key];
    }

    static set(group, key, value) {
        let data = PersistentStorage._getStorage();
        if(!data[group]) data[group] = {};
        data[group][key] = value;
        localStorage._zeppPlayer_storage = JSON.stringify(data);
    }

    static wipe() {
        localStorage._zeppPlayer_storage = "{}";
    }

    static del(group, key) {
        PersistentStorage.set(group, key, null);
    }

    static keys(group) {
        return Object.keys(PersistentStorage._getStorage()[group]);
    }

    static _getStorage() {
        try {
            return JSON.parse(localStorage._zeppPlayer_storage);
        } catch(e) {return {}}
    }
}
