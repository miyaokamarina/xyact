import { Primitive, Falsy, StringLike, Pointer, DEV } from './Prelude';
import { X, Y } from './Xyact';
import { Throw } from './Error';

export const x_key = Symbol();
export const elements: Y.Element[] = [];

declare const never: unique symbol;

declare module './Xyact' {
    export namespace X {
        export type Key = Primitive;

        export type Node = Falsy | StringLike | Element | readonly Node[];

        export interface BaseProps {
            readonly [x_key]?: Key;
        }

        export type Element = CustomElement<BaseProps, readonly any[]> | NativeElement;

        export interface CustomElement<p extends BaseProps, c extends readonly any[]> {
            readonly [never]: readonly ['custom', p, c]
        }

        export interface BaseNativeElement<t extends NativeType, p extends BaseProps, c extends readonly any[]> {
            readonly [never]: readonly ['native', t, p, c];
        }

        export type NativeElement = NativesRegistry[NativeType];
    }

    export namespace Y {
        export type Element = CustomElement | NativeElement;

        export const enum ElementFlags {
            Default /*     */ = 0b0000,
            Custom /*      */ = 0b0001,
            Attached /*    */ = 0b0010,
            Dirty /*       */ = 0b0100,
            Detached /*    */ = 0b1000,

            NotDefault /*  */ = 0b1111,
            NotCustom /*   */ = 0b1110,
            NotAttached /* */ = 0b1101,
            NotDirty /*    */ = 0b1011,
            NotDetached /* */ = 0b0111,
        }

        export const enum ElementProps {
            Flags = 0,
            Seed = 1,
            Parent = 2,
            Previous = 3,

            Root = 4,
            Evaluation = 5,
            Dom = 6,

            Type = 7,
            Props = 8,
            Children = 9,

            Result = 10,
            Keys = 11,
            Attributes = 11,
            Hooks = 12,
        }

        interface BaseElement<z extends Seed, t, c> {
            [ElementProps.Flags]: ElementFlags;
            [ElementProps.Seed]: z;

            [ElementProps.Parent]: Element | undefined;
            [ElementProps.Previous]: Element | undefined;

            [ElementProps.Root]: Root | undefined;
            [ElementProps.Evaluation]: Task | undefined;
            [ElementProps.Dom]: Pointer<any> | undefined;

            [ElementProps.Type]: t;
            [ElementProps.Props]: X.BaseProps;
            [ElementProps.Children]: c;
        }

        export interface CustomElement extends BaseElement<CustomSeed, X.Render<any, any>, any[]> {
            [ElementProps.Result]: Element | undefined;
            [ElementProps.Keys]: PropertyKey[];
            [ElementProps.Hooks]: WeakMap<object, any> | undefined;
        }

        export interface NativeElement extends BaseElement<NativeSeed, X.NativeType, X.Node[]> {
            [ElementProps.Result]: ResultMap | undefined;
            [ElementProps.Attributes]: AttributesMap | undefined;
        }

        export interface AttributesMap extends Map<any, Pointer<any>> {}

        export interface ResultMap extends Map<X.Key, ResultRecord> {}

        export const enum ResultRecordProps {
            Node = 0,
            Element = 1,
        }

        export interface ResultRecord {
            [ResultRecordProps.Node]: X.Node;
            [ResultRecordProps.Element]: Element;
        }

        export interface Root {
            instructions: Instruction[];
            queue: Queue;
        }
    }
}

export function ResultRecord(node: X.Node, element: Y.Element): Y.ResultRecord {
    return [
        node,
        element,
    ];
}

export function useElement(): Y.Element {
    if (DEV && !elements[0]) {
        Throw(Y.ErrorCode.InvalidHook, Y.ErrorMessage.InvalidHook);
    }

    return elements[0];
}
