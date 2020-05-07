import { Falsy, DEV, arrayEquals } from './Prelude';
import { X, Y } from './Xyact';
import { useElement } from './Element';
import { scheduleTask, EffectTask } from './Scheduler';

declare module './Xyact' {
    export namespace X {
        export interface Effect<p extends readonly any[]> {
            (...params: p): void;
        }

        export interface SetupEffect<p extends readonly any[]> {
            (...params: p): TeardownEffect | Falsy;
        }

        export interface TeardownEffect {
            (): unknown;
        }

        export interface EffectOptions {
            readonly priority?: Priority | Falsy;
            readonly type?: EffectType;
        }

        export const enum EffectType {
            Default = 0,
            Once = 1,
            Always = 2,
        }
    }
}

export function Effect<p extends readonly any[]>(setup: X.SetupEffect<p>, options?: X.EffectOptions | Falsy): X.Effect<p> {
    options = options || {};

    let priority = options.priority || X.Priority.Minimum;
    let type = options.type || X.EffectType.Default;

    function useEffect(...params: p) {
        let element = useElement() as Y.CustomElement;
        let hooks = element[Y.ElementProps.Hooks] || (element[Y.ElementProps.Hooks] = new WeakMap());
        let maybe: Y.EffectTask<p> = hooks.get(useEffect) as any;

        let task = maybe || EffectTask(priority, element, setup, params);

        if (type === X.EffectType.Once && element[Y.ElementProps.Flags] & Y.ElementFlags.Attached) return;
        if (!maybe) hooks.set(useEffect, task);

        if (type === X.EffectType.Always || !maybe || !arrayEquals(task[Y.TaskProps.Params], params)) {
            task[Y.TaskProps.Params] = params;

            scheduleTask(task);
        }
    }

    if (DEV) {
        Object.defineProperty(useEffect, 'name', { value: setup.name });
    }

    return useEffect;
}
