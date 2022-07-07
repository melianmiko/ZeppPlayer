export function zeppColorToHex(i) {
    if(typeof i == "string") {
        if(i.startsWith("0x")) {
            // Fuck you............
            i = parseInt(i);
        } else return i;
    }

    let s = i.toString(16);
    if(s.length > 6) s = s.substring(s.length-6, s.length);
    s = "#" + s.padStart(6, "0");
    return s;
}