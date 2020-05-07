import {} from './Prelude';

declare module './Xyact' {
    export namespace X {
        export interface Renderer<d> {
            readonly createNode: (type: NativeType) => d;
            readonly replaceNode: (oldElement: d, newElement: d) => unknown;
            readonly removeNode: (oldElement: d) => unknown;
            readonly prependNode: (parentElement: d, newElement: d) => unknown;
            readonly insertAfterNode: (previousSiblingElement: d, newElement: d) => unknown;
            readonly setAttribute: (targetElement: d, attributeName: AttributeName, attributeValue: AttributeValue) => unknown;
            readonly removeAttribute: (attributeName: AttributeName) => unknown;
        }
    }
}
