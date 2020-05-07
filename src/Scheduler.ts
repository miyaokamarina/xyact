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
            Type = 0,
            Priority = 1,
            Previous = 2,
            Next = 3,
            Element = 4,
            Setup = 5,
            Teardown = 6,
            Params = 7,
        }

        export interface BaseTask<t extends TaskType> {
            [TaskProps.Type]: t;
            [TaskProps.Priority]: X.Priority;
            [TaskProps.Previous]: Task | undefined;
            [TaskProps.Next]: Task | undefined;
        }

        export interface ElementTask<t extends TaskType> extends BaseTask<t> {
            [TaskProps.Element]: Element;
        }

        export interface EffectTask<p extends readonly any[]> extends ElementTask<TaskType.Effect> {
            [TaskProps.Setup]: X.SetupEffect<p>;
            [TaskProps.Teardown]: X.TeardownEffect | undefined;
            [TaskProps.Params]: p;
        }

        export interface EvaluationTask extends ElementTask<TaskType.Evaluation> {}

        export interface TeardownTask extends ElementTask<TaskType.Teardown> {}

        export const enum QueueProps {
            First = 0,
        }

        export interface Queue {
            [QueueProps.First]: Task | undefined;

            [X.Priority.Maximum]: Segment;
            [X.Priority.User]: Segment;
            [X.Priority.Network]: Segment;
            [X.Priority.Store]: Segment;
            [X.Priority.Other]: Segment;
            [X.Priority.Minimum]: Segment;
        }

        export const enum SegmentProps {
            First = 0,
            Last = 1,
        }

        export interface Segment {
            [SegmentProps.First]: Task | undefined;
            [SegmentProps.Last]: Task | undefined;
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
    let element = task[Y.TaskProps.Element];
    let flags = element[Y.ElementProps.Flags];
    let type = task[Y.TaskProps.Type];
    let evaluation = element[Y.ElementProps.Evaluation];
    let priority = task[Y.TaskProps.Priority];

    if (type === Y.TaskType.Evaluation) {
        if (flags & Y.ElementFlags.Detached) {
            return;
        }

        if (evaluation) {
            // If the element has an existing evaluation task:
            //
            // 1. If its priority is less than priority of new task, dequeue it.
            // 2. Otherwise, short circuit.

            if (evaluation[Y.TaskProps.Priority] > priority) dequeueTask(evaluation);
            else return;
        }

        element[Y.ElementProps.Evaluation] = task;
    }

    if (type === Y.TaskType.Teardown) {
        element[Y.ElementProps.Flags] |= Y.ElementFlags.Detached;
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
