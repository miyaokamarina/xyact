import { DEV, NotImplementedError, u } from './Prelude';
import { X, Y } from './Xyact';

declare module './Xyact' {
    export namespace X {
        export const enum Priority {
            Realtime = 7,
            Maximum = 6,
            User = 5,
            Network = 4,
            Store = 3,
            Other = 2,
            Minimum = 1,
            Disabled = -1,
        }
    }

    export namespace Y {
        export type Task = EffectTask<any> | EvaluationTask | TeardownTask;

        export const enum TaskType {
            Effect = 1,
            Evaluation = 2,
            Teardown = 3,
        }

        export const enum TaskProps {
            type = 0,
            priority = 1,
            previous = 2,
            next = 3,
            element = 4,
            setup = 5,
            teardown = 6,
            params = 7,
        }

        export interface BaseTask<t extends TaskType> {
            [TaskProps.type]: t;
            [TaskProps.priority]: X.Priority;
            [TaskProps.previous]: Task | undefined;
            [TaskProps.next]: Task | undefined;
        }

        export interface ElementTask<t extends TaskType> extends BaseTask<t> {
            [TaskProps.element]: Element;
        }

        export interface EffectTask<p extends readonly any[]> extends ElementTask<TaskType.Effect> {
            [TaskProps.setup]: X.SetupEffect<p>;
            [TaskProps.teardown]: X.TeardownEffect | undefined;
            [TaskProps.params]: p;
        }

        export interface EvaluationTask extends ElementTask<TaskType.Evaluation> {}

        export interface TeardownTask extends ElementTask<TaskType.Teardown> {}

        export const enum QueueProps {
            first = 0,
        }

        export interface Queue {
            [QueueProps.first]: Task | undefined;

            [X.Priority.Maximum]: Segment;
            [X.Priority.User]: Segment;
            [X.Priority.Network]: Segment;
            [X.Priority.Store]: Segment;
            [X.Priority.Other]: Segment;
            [X.Priority.Minimum]: Segment;
        }

        export const enum SegmentProps {
            first = 0,
            last = 1,
        }

        export interface Segment {
            [SegmentProps.first]: Task | undefined;
            [SegmentProps.last]: Task | undefined;
        }
    }
}

export function Segment(): Y.Segment {
    return [
        u, // First
        u, // Last
    ];
}

export function Queue(): Y.Queue {
    return [
        u, //         First
        Segment(), // Minimum
        Segment(), // Other
        Segment(), // Store
        Segment(), // Network
        Segment(), // User
        Segment(), // Maximum
    ];
}

export function ElementTask(type: Y.TaskType.Evaluation, priority: X.Priority, element: Y.Element): Y.EvaluationTask;
export function ElementTask(type: Y.TaskType.Teardown, priority: X.Priority, element: Y.Element): Y.TeardownTask;
export function ElementTask(type: Y.TaskType.Evaluation | Y.TaskType.Teardown, priority: X.Priority, element: Y.Element): Y.ElementTask<Y.TaskType> {
    return [
        type, //     Type
        priority, // Priority
        u, //        Previous
        u, //        Next
        element, //  Element
    ];
}

export function EffectTask<p extends readonly any[]>(priority: X.Priority, element: Y.Element, setup: X.SetupEffect<p>, params: p): Y.EffectTask<p> {
    return [
        Y.TaskType.Effect, // Type
        priority, //          Priority
        u, //                 Previous
        u, //                 Next
        element, //           Element
        setup, //             Setup
        u, //                 Teardown
        params, //            Params
    ];
}

export function scheduleTask(task: Y.Task): void {
    let element = task[Y.TaskProps.element];
    let flags = element[Y.ElementProps.flags];
    let type = task[Y.TaskProps.type];
    let evaluation = element[Y.ElementProps.evaluation];
    let priority = task[Y.TaskProps.priority];

    if (type === Y.TaskType.Evaluation) {
        if (flags & Y.ElementFlags.Detached) {
            return;
        }

        if (evaluation) {
            // If the element has an existing evaluation task:
            //
            // 1. If its priority is less than priority of new task, dequeue it.
            // 2. Otherwise, short circuit.

            if (evaluation[Y.TaskProps.priority] > priority) dequeueTask(evaluation);
            else return;
        }

        element[Y.ElementProps.evaluation] = task;
    }

    if (type === Y.TaskType.Teardown) {
        element[Y.ElementProps.flags] |= Y.ElementFlags.Detached;
    }

    if (DEV) {
        if (priority === X.Priority.Realtime) {
            executeTask(task);
        } else {
            enqueueTask(task);
        }
    } else {
        // Optimized equivalent of the DEV-branch:
        (priority === X.Priority.Realtime ? executeTask : enqueueTask)(task);
    }
}

export function executeTask(task: Y.Task): void {
    void task;

    throw new NotImplementedError('executeTask');
}

export function enqueueTask(task: Y.Task): void {
    void task;

    throw new NotImplementedError('enqueueTask');
}

export function dequeueTask(task: Y.Task): void {
    void task;

    throw new NotImplementedError('dequeueTask');
}
