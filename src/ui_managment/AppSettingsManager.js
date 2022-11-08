export default class AppSettingsManager {
    static getString(key, fallback) {
        if(localStorage[`zp_${key}`] === undefined)
            return fallback;
        return localStorage[`zp_${key}`];
    }

    static setString(key, value) {
        localStorage[`zp_${key}`] = value;
    }

    static getObject(key, fallback) {
        if(localStorage[`zp_${key}`] === undefined)
            return fallback;
        return JSON.parse(localStorage[`zp_${key}`]);
    }

    static setObject(key, value) {
        localStorage[`zp_${key}`] = JSON.stringify(value);
    }
}
