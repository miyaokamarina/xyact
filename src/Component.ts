import { DEV, OptionalArray, OptionalObject } from './Prelude';
import { X, Y } from './Xyact';

import { useElement, x_key } from './Element';
import { seeds } from './Seed';

export const default_key = Symbol();

declare module './Xyact' {
    export namespace X {
        export type Component = CustomComponent<BaseProps, readonly any[]> | NativeComponent<NativeType>;

        export interface CustomComponent<p extends BaseProps, c extends readonly any[]> {
            (props: OptionalObject<p>, children: OptionalArray<c>): CustomElement<p, c>;
        }

        export interface NativeComponent<t extends NativeType> {
            (props: NativeProps<t>, children: NativeChildren<t>): NativesRegistry[t];
        }

        export type NativeProps<t extends NativeType> = NativesRegistry[t] extends BaseNativeElement<any, infer p, any> ? OptionalObject<p> : never;
        export type NativeChildren<t extends NativeType> = NativesRegistry[t] extends BaseNativeElement<any, any, infer c> ? OptionalArray<c> : never;

        export interface Render<p extends BaseProps, c extends readonly any[]> {
            (props: p, children: c): Node;
        }
    }
}

export function Component<t extends X.NativeType>(type: t): X.NativeComponent<t>;
export function Component<p extends X.BaseProps, c extends any[]>(type: X.Render<p, c>): X.CustomComponent<p, c>;
export function Component(type: X.NativeType | X.Render<any, any>): X.Component {
    let flags = typeof type !== 'number' ? Y.ElementFlags.Custom : Y.ElementFlags.Default;

    function Component(props: any, children: any) {
        props = props || {};

        let element = {} as any;
        let { [x_key]: _, ...rest } = props;

        seeds.set(element, [
            flags as any, //                                Flags
            x_key in props ? props[x_key] : default_key, // Key
            type, //                                        Type
            rest, //                                        Props
            children || [], //                              Children
            useElement(), //                                Owner
        ]);

        return element;
    }

    if (DEV) {
        if (flags) {
            Object.defineProperty(Component, 'name', { value: (type as any).name });
        } else {
            Object.defineProperty(Component, 'name', { value: String(type) });
        }
    }

    return Component;
}
