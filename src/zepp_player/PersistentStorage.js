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
