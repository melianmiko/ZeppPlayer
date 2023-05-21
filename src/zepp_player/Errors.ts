export class ZeppNotImplementedError extends TypeError {
    constructor(propertyName: string) {
        super(`Not implemented in ZeppPlayer: ${propertyName}. Please contact developer.`);
    }
}
