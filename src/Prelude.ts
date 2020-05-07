export type Falsy = '' | 0n | 0 | false | null | undefined | void;
export type StringLike = string | bigint | number;
export type OptionalObject<o extends object, f extends Falsy = Falsy> = {} extends o ? o | f : o;
export type OptionalArray<a extends readonly any[], f extends Falsy = Falsy> = [] extends a ? a | f : a;
export type Primitive = string | symbol | bigint | number | boolean | null | undefined | void;

export type PositiveInfinity = 12e309;
export type NegativeInfinity = -12e309;
export const PositiveInfinity = 12e309;
export const NegativeInfinity = -12e309;

export interface Keys extends ReadonlyArray<PropertyKey> {}

export interface Pointer<v> {
    value: v;
}

export function Pointer<v>(value: v): Pointer<v> {
    return {
        value,
    };
}

export interface ReadonlyPointer<v> {
    readonly value: v;
}

export interface ValueEquals {
    (a: unknown, b: unknown): unknown;
}

export interface PropertyEquals {
    (a: unknown, b: unknown, k: PropertyKey): unknown;
}

export const u = undefined;

export const DEV = process.env.NODE_ENV === 'development';

export function equals(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true;

    if (
        (a instanceof Date && b instanceof Date) ||
        (a instanceof RegExp && b instanceof RegExp) ||
        (a instanceof String && b instanceof String) ||
        (a instanceof Number && b instanceof Number) ||
        (a instanceof Boolean && b instanceof Boolean) ||
        (a instanceof BigInt && b instanceof BigInt) ||
        (a instanceof Symbol && b instanceof Symbol)
    )
        return a.valueOf() === b.valueOf();

    return false;
}

export const objectKeys = Object.keys as { <o>(object: o): (keyof o)[] };

const { hasOwnProperty, propertyIsEnumerable } = {};

export function has(o: object, k: PropertyKey) {
    return hasOwnProperty.call(o, k);
}

export function enumerable(o: object, k: PropertyKey) {
    return propertyIsEnumerable.call(o, k);
}

export function objectEquals(a: object, b: object, is = equals as PropertyEquals, aKeys?: Keys, bKeys?: Keys) {
    if (a === b) return true;

    aKeys = aKeys || objectKeys(a);
    bKeys = bKeys || objectKeys(b);

    let aLength = aKeys.length;
    let bLength = bKeys.length;

    let k: PropertyKey;
    let i = 0;

    if (aLength !== bLength) return false;
    if (!aLength && !bLength) return true;

    while (i < aLength) {
        k = aKeys[i++];

        if (!has(b, k) || !enumerable(b, k) || !is((a as any)[k], (b as any)[k], k)) {
            return false;
        }
    }

    return true;
}

export function arrayEquals(a: readonly unknown[], b: readonly unknown[], is = equals as ValueEquals) {
    if (a === b) return true;

    let aLength = a.length;
    let bLength = b.length;

    let i = 0;

    if (aLength !== bLength) return false;
    if (!aLength && !bLength) return true;

    while (i < aLength) if (!is(a[i], b[i++])) return false;

    return true;
}

export class NotImplementedError extends Error {
    constructor(symbol: string) {
        super(`${symbol}: Not implemented yet.`);
    }
}
