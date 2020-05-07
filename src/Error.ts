import { Y, VERSION } from './Xyact';

declare module './Xyact' {
    export namespace Y {
        export const enum ErrorCode {
            InvalidHook = 1,
            InvalidMultimount = 2,
            InvalidEvaluation = 3,
        }

        export const enum ErrorMessage {
            InvalidHook = 'Cannot call hook on empty elements stack.',
            InvalidMultimount = 'Cannot mount element twice.',
            InvalidEvaluation = 'Cannot evaluate element on empty elements stack.',
        }
    }
}

class XyactError extends Error {
    name = 'XyactError';

    constructor(code: Y.ErrorCode, message?: Y.ErrorMessage) {
        super(message ? code + ' ' + message : 'https://xyact.fuck-anime.dev/v' + VERSION + '/error-' + code);
    }
}

export function Throw(code: Y.ErrorCode, message?: Y.ErrorMessage): never {
    throw new XyactError(code, message);
}
