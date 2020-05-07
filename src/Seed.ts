import { X, Y } from './Xyact';

import { fragment, plain } from './Natives';

export const seeds = new WeakMap<X.Element, Y.Seed>();

declare module './Xyact' {
    export namespace Y {
        export type Seed = CustomSeed | NativeSeed;

        export const enum SeedProps {
            flags = 0,
            key = 1,
            type = 2,
            props = 3,
            children = 4,
            owner = 5,
        }

        interface BaseSeed<f extends ElementFlags, t, c> {
            [SeedProps.flags]: f;
            [SeedProps.key]: X.Key;
            [SeedProps.type]: t;
            [SeedProps.props]: Record<PropertyKey, any>;
            [SeedProps.children]: c;
            [SeedProps.owner]: Element | undefined;
        }

        export interface CustomSeed extends BaseSeed<ElementFlags.Custom, X.Render<any, any>, any[]> {}

        export interface NativeSeed extends BaseSeed<ElementFlags.Custom, X.NativeType, X.Node[]> {}
    }
}

export function Seed(node: X.Node): Y.Seed {
    return seeds.get(Array.isArray(node) ? fragment(0, node) : typeof node === 'object' && node ? (node as X.Element) : plain({ value: node }))!;
}
