import { Keyof, Primitive, Falsy, StringLike, Pointer, DEV, u, Valueof } from './Prelude';
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
            readonly [never]: readonly ['custom', p, c];
        }

        export interface BaseNativeElement<t extends NativeType, p extends BaseProps, c extends readonly any[]> {
            readonly [never]: readonly ['native', t, p, c];
        }

        export type NativeElement = NativesRegistry[NativeType];

        export type AttributeName = Keyof<NativeElement[typeof never][2]>;
        export type AttributeValue = Valueof<NativeElement[typeof never][2]>;
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
            flags = 0,
            seed = 1,
            parent = 2,
            previous = 3,

            root = 4,
            evaluation = 5,
            dom = 6,

            props = 7,
            children = 8,

            result = 9,
            keys = 10,
            attributes = 10,
            hooks = 11,
        }

        interface BaseElement<z extends Seed, c> {
            [ElementProps.flags]: ElementFlags;
            [ElementProps.seed]: z;

            [ElementProps.parent]: Element | undefined;
            [ElementProps.previous]: Element | undefined;

            [ElementProps.root]: Root | undefined;
            [ElementProps.evaluation]: Task | undefined;
            [ElementProps.dom]: Pointer<any> | undefined;

            [ElementProps.props]: X.BaseProps;
            [ElementProps.children]: c;
        }

        export interface CustomElement extends BaseElement<CustomSeed, any[]> {
            [ElementProps.result]: Element | undefined;
            [ElementProps.keys]: PropertyKey[];
            [ElementProps.hooks]: WeakMap<object, any> | undefined;
        }

        export interface NativeElement extends BaseElement<NativeSeed, X.Node[]> {
            [ElementProps.result]: ResultMap;
            [ElementProps.attributes]: AttributesMap;
        }

        export interface AttributesMap extends Map<any, Pointer<any>> {}

        export interface ResultMap extends Map<X.Key, ResultRecord> {}

        export const enum ResultRecordProps {
            node = 0,
            element = 1,
        }

        export interface ResultRecord {
            [ResultRecordProps.node]: X.Node;
            [ResultRecordProps.element]: Element;
        }

        export const enum RootProps {
            instructions = 0,
            queue = 1,
        }

        export interface Root {
            [RootProps.instructions]: Instruction[];
            [RootProps.queue]: Queue;
        }

        export type Type = X.Render<any, any> | X.NativeType;
    }
}

export function Element(seed: Y.CustomSeed): Y.CustomElement;
export function Element(seed: Y.NativeSeed): Y.NativeElement;
export function Element(seed: Y.Seed): Y.Element;
export function Element(seed: Y.Seed): Y.Element {
    if (DEV) {
        if (seed[Y.SeedProps.flags] & Y.ElementFlags.Custom) {
            return CustomElement(seed as Y.CustomSeed);
        } else {
            return NativeElement(seed as Y.NativeSeed);
        }
    } else {
        return (seed[Y.SeedProps.flags] ? CustomElement : NativeElement)(seed as Y.CustomSeed & Y.NativeSeed);
    }
}

function CustomElement(seed: Y.CustomSeed): Y.CustomElement {
    return [
        Y.ElementFlags.Custom, // Flags
        seed, //                  Seed
        u, //                     Parent
        u, //                     Previous
        u, //                     Root
        u, //                     Evaluation
        u, //                     Dom
        {}, //                    Props
        [], //                    Children
        u, //                     Result
        [], //                    Keys
        u, //                     Hooks
    ];
}

function NativeElement(seed: Y.NativeSeed): Y.NativeElement {
    return [
        Y.ElementFlags.Default, // Flags
        seed, //                   Seed
        u, //                      Parent
        u, //                      Previous
        u, //                      Root
        u, //                      Evaluation
        u, //                      Dom
        {}, //                     Props
        [], //                     Children
        new Map(), //              Result
        new Map(), //              Attributes
    ];
}

export function ResultRecord(node: X.Node, element: Y.Element): Y.ResultRecord {
    return [node, element];
}

export function useElement(): Y.Element {
    if (DEV && !elements[0]) {
        Throw(Y.ErrorCode.InvalidHook, Y.ErrorMessage.InvalidHook);
    }

    return elements[0];
}
