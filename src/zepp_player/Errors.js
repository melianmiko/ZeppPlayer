export class ZeppNotImplementedError extends TypeError {
    constructor(propertyName) {
        super(`Not implemented in ZeppPlayer: ${propertyName}. Please contact developer.`);
    }
}