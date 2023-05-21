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

export function zeppColorToHex(i: number|string): string {
    if(i === null || i === undefined) return "#000000";

    if(typeof i == "string") {
        if(i.startsWith("0x")) {
            i = parseInt(i);
        } else {
            return i;
        }
    }

    let s = i.toString(16);
    if(s.length > 6) s = s.substring(s.length-6, s.length);
    s = "#" + s.padStart(6, "0");

    return s;
}
