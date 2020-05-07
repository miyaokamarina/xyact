import { Falsy, StringLike } from './Prelude';
import { X } from './Xyact';

import { Component } from './Component';

declare module './Xyact' {
    export namespace X {
        export const enum NativeType {
            Fragment = -2,
            Plain = -1,
        }

        export interface NativesRegistry {
            readonly [NativeType.Plain]: Plain;
            readonly [NativeType.Fragment]: Fragment;
        }

        export interface Plain extends BaseNativeElement<NativeType.Plain, Plain.Props, Plain.Children> {}

        export namespace Plain {
            export interface Props extends BaseProps {
                readonly value?: StringLike | Falsy;
            }

            export type Children = readonly [];
        }

        export interface Fragment extends BaseNativeElement<NativeType.Fragment, Fragment.Props, Fragment.Children> {}

        export namespace Fragment {
            export interface Props extends BaseProps {}

            export interface Children extends ReadonlyArray<Node> {}
        }
    }
}

export const plain = /*#__PURE__*/ Component(X.NativeType.Plain);
export const fragment = /*#__PURE__*/ Component(X.NativeType.Fragment);
