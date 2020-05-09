import { DEV, equals, Falsy, u } from './Prelude';
import { X, Y } from './Xyact';

import { Effect } from './Effect';
import { useElement } from './Element';
import { ElementTask, scheduleTask } from './Scheduler';

declare module './Xyact' {
    export namespace X {
        export interface State<p extends readonly any[], s> {
            (...params: p): StateTuple<s>;
        }

        export interface StateOptions {
            readonly priority?: Priority;
            readonly type?: StateType;
            readonly silent?: boolean | Falsy;
        }

        export type StateTuple<s> = readonly [s, StateSetter<s>, StateGetter<s>];

        export interface StateInitializer<p extends readonly any[], s> {
            (...params: p): s;
        }

        export interface StateSetter<s> {
            (next: s): void;
        }

        export interface StateGetter<s> {
            (): s;
        }

        export const enum StateType {
            Default = 0,
            Once = 1,
            Always = 2,
        }
    }

    export namespace Y {
        export interface StateRecord<p extends readonly any[], s> {
            setState: X.StateSetter<s>;
            getState: X.StateGetter<s>;
            effect: X.Effect<p>;
            value: s;
        }
    }
}

export function State<p extends readonly any[], s>(initializer: X.StateInitializer<p, s>, options: X.StateOptions | Falsy): X.State<p, s> {
    options = options || {};

    let priority = options.priority || X.Priority.Minimum;
    let type = options.type || X.StateType.Default;
    let silent = options.silent || false;

    let effectOptions: X.EffectOptions = {
        type: type as any,
        priority: X.Priority.Realtime,
    };

    function useState(...params: p): X.StateTuple<s> {
        let element = useElement() as Y.CustomElement;
        let hooks = element[Y.ElementProps.hooks] || (element[Y.ElementProps.hooks] = new WeakMap());
        let maybe: Y.StateRecord<p, s> = hooks.get(useState) as any;

        let record: Y.StateRecord<p, s> = maybe || {
            setState(next) {
                if (equals(record.value, next)) return;

                record.value = next;

                if (silent) return;

                element[Y.ElementProps.flags] |= Y.ElementFlags.Dirty;

                scheduleTask(element[Y.ElementProps.root]!, ElementTask(Y.TaskType.Evaluation, priority, element));
            },
            getState() {
                return record.value;
            },
            effect: Effect(function useStateEffect(...params) {
                record.value = initializer(...params);
            }, effectOptions),
            value: u!,
        };

        if (!maybe) hooks.set(useState, record);

        record.effect(...params);

        return [record.value, record.setState, record.getState];
    }

    if (DEV) {
        Object.defineProperty(useState, 'name', { value: initializer.name });
    }

    return useState;
}
