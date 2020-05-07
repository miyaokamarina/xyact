import { arrayEquals, DEV, equals, objectEquals, objectKeys, Pointer, PointerProps, has, u, NotImplementedError } from './Prelude';
import { X, Y } from './Xyact';

import { Throw } from './Error';
import { Element, elements, ResultRecord } from './Element';
import { Seed } from './Seed';

const implicits: symbol[] = [];

function preinsNode(instructions: Y.Instruction[], element: Y.Element, previousElement: Y.Element | undefined, newElement: Y.Element): void {
    instructions.push([Y.InstructionCode.PreinsNode, element, previousElement, newElement]);
}

function setAttribute(instructions: Y.Instruction[], element: Y.Element, key: unknown, value: unknown): void {
    instructions.push([Y.InstructionCode.SetAttribute, element, key, value]);
}

function link(newElement: Y.Element, previousElement: Y.Element | undefined): Y.Element {
    newElement[Y.ElementProps.previous] = previousElement;

    return newElement;
}

function relocate(root: Y.Root, element: Y.Element, oldElement: Y.Element, newElement: Y.Element, previousElement: Y.Element | undefined): void {
    if (oldElement[Y.ElementProps.previous]?.[Y.ElementProps.dom] !== previousElement?.[Y.ElementProps.dom]) {
        preinsNode(root[Y.RootProps.instructions], element, previousElement, newElement);
    }
}

function teardownRemove(root: Y.Root, oldElement: Y.Element): void {
    teardown(oldElement);
    root[Y.RootProps.instructions].push([Y.InstructionCode.RemoveNode, oldElement]);
}

function teardownReplace(root: Y.Root, oldElement: Y.Element, newElement: Y.Element) {
    teardown(oldElement);
    root[Y.RootProps.instructions].push([Y.InstructionCode.ReplaceNode, oldElement, newElement]);

    return newElement;
}

function evaluateSeed(root: Y.Root, seed: Y.Seed): Y.Element {
    return evaluate(root, Element(seed));
}

function updateElement(root: Y.Root, element: Y.Element, seed: Y.Seed) {
    element[Y.ElementProps.seed] = seed;

    return evaluate(root, element);
}

function branch3(
    root: Y.Root,
    element: Y.Element,
    key: X.Key,
    oldResult: Y.ResultMap,
    newResult: Y.ResultMap,
    oldElement: Y.Element,
    newNode: X.Node,
    newSeed: Y.Seed,
    previousElement: Y.Element | undefined,
) {
    let newElement = evaluateSeed(root, newSeed);

    teardownReplace(root, oldElement, newElement);
    relocate(root, element, oldElement, newElement, previousElement);

    newResult.set(key, ResultRecord(newNode, newElement));
    oldResult.delete(key);

    return link(newElement, previousElement);
}

function branch4(
    root: Y.Root,
    element: Y.Element,
    key: X.Key,
    oldResult: Y.ResultMap,
    newResult: Y.ResultMap,
    oldElement: Y.Element,
    newNode: X.Node,
    newSeed: Y.Seed,
    previousElement: Y.Element | undefined,
) {
    updateElement(root, oldElement, newSeed);

    return branch5(root, element, key, oldResult, newResult, oldElement, newNode, newSeed, previousElement);
}

function branch5(
    root: Y.Root,
    element: Y.Element,
    key: X.Key,
    oldResult: Y.ResultMap,
    newResult: Y.ResultMap,
    oldElement: Y.Element,
    newNode: X.Node,
    __: Y.Seed,
    previousElement: Y.Element | undefined,
) {
    newResult.set(key, ResultRecord(newNode, oldElement));
    oldResult.delete(key);
    relocate(root, element, oldElement, oldElement, previousElement);

    return link(oldElement, previousElement);
}

function branch6(
    root: Y.Root,
    element: Y.NativeElement,
    key: X.Key,
    _: Y.ResultMap,
    newResult: Y.ResultMap,
    __: Y.Element,
    newNode: X.Node,
    newSeed: Y.Seed,
    previousElement: Y.Element | undefined,
) {
    let newElement = evaluateSeed(root, newSeed);

    preinsNode(root[Y.RootProps.instructions], element, previousElement, newElement);
    newResult.set(key, ResultRecord(newNode, newElement));

    return link(newElement, previousElement);
}

function teardown(element: Y.Element): void {
    void element;

    throw new NotImplementedError('teardown');
}

function evaluateCustom(root: Y.Root, element: Y.CustomElement): void {
    let result = element[Y.ElementProps.result];
    let seed: Y.Seed = element[Y.ElementProps.seed];
    let props = seed[Y.SeedProps.props];
    let children = seed[Y.SeedProps.children];
    let flags = element[Y.ElementProps.flags];

    if (
        flags & Y.ElementFlags.Attached &&
        !(flags & Y.ElementFlags.Dirty) &&
        objectEquals(element[Y.ElementProps.props], props, equals, element[Y.ElementProps.keys], (element[Y.ElementProps.keys] = objectKeys(props))) &&
        arrayEquals(element[Y.ElementProps.children], children)
    ) {
        return;
    }

    element[Y.ElementProps.keys] = objectKeys(props);

    seed = Seed(seed[Y.SeedProps.type](props, children));

    result = element[Y.ElementProps.result] = !(flags & Y.ElementFlags.Attached)
        ? evaluateSeed(root, seed)
        : seed[Y.SeedProps.type] !== result![Y.ElementProps.seed][Y.SeedProps.type]
        ? teardownReplace(root, result!, evaluateSeed(root, seed))
        : updateElement(root, result!, seed);

    element[Y.ElementProps.dom] = result[Y.ElementProps.dom];
}

function evaluateNative(root: Y.Root, element: Y.NativeElement): void {
    let instructions = root[Y.RootProps.instructions];
    let newSeed: Y.Seed = element[Y.ElementProps.seed];
    let oldAttributes = element[Y.ElementProps.attributes];
    let oldResult = element[Y.ElementProps.result];
    let newProps = newSeed[Y.SeedProps.props];
    let newChildren = newSeed[Y.SeedProps.children];

    if (!(element[Y.ElementProps.flags] & Y.ElementFlags.Attached)) {
        instructions.push([Y.InstructionCode.CreateNode, element]);
    }

    if (element[Y.ElementProps.props] !== newProps) {
        let keys = objectKeys(newProps);
        let i = 0;
        let l = keys.length;
        let newAttributes: Y.AttributesMap = new Map();
        let key: any;
        let newValue: any;
        let oldAttributeRecord: Pointer<any> | undefined;

        while (i < l) {
            key = keys[i];
            newValue = newProps[key];
            oldAttributeRecord = oldAttributes.get(key);

            if (oldAttributeRecord) {
                oldAttributes.delete(key);

                if (!equals(oldAttributeRecord[PointerProps.value], newValue)) {
                    setAttribute(instructions, element, key, newValue);
                }
            } else {
                setAttribute(instructions, element, key, newValue);
            }

            newAttributes.set(key, Pointer(newValue));
        }

        for (key of oldAttributes.keys()) {
            instructions.push([Y.InstructionCode.RemoveAttribute, element, key]);
        }

        element[Y.ElementProps.attributes] = newAttributes;
    }

    if (element[Y.ElementProps.children] !== newChildren) {
        let oldType: Y.Type;
        let newType: Y.Type;
        let key: X.Key;
        let oldResultRecord: Y.ResultRecord | undefined;
        let oldElement: Y.Element;
        let newNode: X.Node;
        let l = newChildren.length;
        let i = 0;
        let j = 0;
        let newResult: Y.ResultMap = new Map<X.Key, Y.ResultRecord>();
        let previousElement: Y.Element | undefined = u;
        let keys = oldResult.keys();

        while (i < l) {
            newNode = newChildren[i];
            newSeed = Seed(newNode);
            key = has(newSeed, 'key') ? newSeed[Y.SeedProps.key] : implicits[j++] || (implicits[j] = Symbol());
            oldResultRecord = oldResult.get(key);

            if (oldResultRecord) {
                oldElement = oldResultRecord[Y.ResultRecordProps.element];

                if (!equals(oldResultRecord[Y.ResultRecordProps.node], newNode)) {
                    oldType = oldElement[Y.ElementProps.seed][Y.SeedProps.type];
                    newType = newSeed[Y.SeedProps.type];

                    if (oldType !== newType) {
                        if (oldType === X.NativeType.Plain) {
                            while (oldType === X.NativeType.Plain) {
                                oldResult.delete(key);
                                teardownRemove(root, oldElement);

                                key = keys.next().value;

                                if (key != u) {
                                    oldElement = oldResult.get(key)![Y.ResultRecordProps.element];
                                    oldType = oldElement[Y.ElementProps.seed][Y.SeedProps.type];
                                } else {
                                    break;
                                }
                            }
                        } else if (newType === X.NativeType.Plain) {
                            while (newType === X.NativeType.Plain) {
                                oldResultRecord = oldResult.get(key);

                                if (DEV) {
                                    //
                                } else {
                                    previousElement = (oldResultRecord
                                        ? ((oldElement = oldResultRecord[Y.ResultRecordProps.element]),
                                          oldResult.delete(key),
                                          !equals(oldResultRecord[Y.ResultRecordProps.node], newNode)
                                              ? oldElement[Y.ElementProps.seed][Y.SeedProps.type] !== X.NativeType.Plain
                                                  ? branch3
                                                  : branch4
                                              : branch5)
                                        : branch6)(root, element, key, oldResult, newResult, oldElement, newNode, newSeed, previousElement);
                                }

                                if (++i < l) {
                                    newNode = newChildren[i];
                                    newSeed = Seed(newNode);
                                    newType = newSeed[Y.SeedProps.type];
                                    key = has(newSeed, 'key') ? newSeed[Y.SeedProps.key] : implicits[j++] || (implicits[j] = Symbol());
                                } else {
                                    break;
                                }
                            }
                        } else {
                            previousElement = branch3(root, element, key, oldResult, newResult, oldElement, newNode, newSeed, previousElement);
                            i++;
                        }
                    } else {
                        previousElement = branch4(root, element, key, oldResult, newResult, oldElement, newNode, newSeed, previousElement);
                        i++;
                    }
                } else {
                    previousElement = branch5(root, element, key, oldResult, newResult, oldElement, newNode, newSeed, previousElement);
                    i++;
                }
            } else {
                previousElement = branch6(root, element, key, oldResult, newResult, u!, newNode, newSeed, previousElement);
                i++;
            }
        }

        for (oldResultRecord of oldResult.values()) {
            teardownRemove(root, oldResultRecord[Y.ResultRecordProps.element]);
        }

        element[Y.ElementProps.result] = newResult;
    }
}

export function evaluate(root: Y.Root, element: Y.Element): Y.Element {
    let seed = element[Y.ElementProps.seed];
    let parent = elements[0];

    if (DEV && !element[Y.ElementProps.parent]) {
        Throw(Y.ErrorCode.InvalidEvaluation, Y.ErrorMessage.InvalidEvaluation);
    }

    if (element[Y.ElementProps.parent] !== parent) {
        // TODO: Don’t throw, clone instead.

        if (DEV) {
            Throw(Y.ErrorCode.InvalidMultimount, Y.ErrorMessage.InvalidMultimount);
        }
    }

    element[Y.ElementProps.root] = root;
    element[Y.ElementProps.parent] = parent;
    elements.unshift(element);

    if (DEV) {
        if (element[Y.ElementProps.flags] & Y.ElementFlags.Custom) {
            evaluateCustom(root, element as Y.CustomElement);
        } else {
            evaluateNative(root, element as Y.NativeElement);
        }
    } else {
        (element[Y.ElementProps.flags] & Y.ElementFlags.Custom ? evaluateCustom : evaluateNative)(root, element as Y.NativeElement & Y.CustomElement);
    }

    element[Y.ElementProps.props] = seed[Y.SeedProps.props];
    element[Y.ElementProps.children] = seed[Y.SeedProps.children];

    elements.shift();

    return element;
}
