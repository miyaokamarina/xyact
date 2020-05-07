import { X, Y } from './Xyact';
import { fragment, plain } from './Natives';

export const seeds = new WeakMap<X.Element, Y.Seed>();

declare module './Xyact' {
    export namespace Y {
        export type Seed = CustomSeed | NativeSeed;

        export const enum SeedProps {
            Flags = 0,
            Key = 1,
            Type = 2,
            Props = 3,
            Children = 4,
            Owner = 5,
        }

        interface BaseSeed<f extends ElementFlags, t, c> {
            [SeedProps.Flags]: f;
            [SeedProps.Key]: X.Key;
            [SeedProps.Type]: t;
            [SeedProps.Props]: Record<PropertyKey, any>;
            [SeedProps.Children]: c;
            [SeedProps.Owner]: Element | undefined;
        }

        export interface CustomSeed extends BaseSeed<ElementFlags.Custom, X.Render<any, any>, any[]> {}

        export interface NativeSeed extends BaseSeed<ElementFlags.Custom, X.NativeType, X.Node[]> {}
    }
}

export function Seed(node: X.Node): Y.Seed {
    return seeds.get(Array.isArray(node) ? fragment(0, node) : typeof node === 'object' && node ? (node as X.Element) : plain({ value: node }))!;
}
