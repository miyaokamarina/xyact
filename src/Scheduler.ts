import { DEV, never, NotImplementedError, u } from './Prelude';
import { X, Y } from './Xyact';
import { evaluate, teardown } from './Reconciler';

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
            Effect = 0,
            Evaluation = 1,
            Teardown = 2,
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

export function scheduleTask(root: Y.Root, task: Y.Task): void {
    let element = task[Y.TaskProps.element];
    let type = task[Y.TaskProps.type];
    let evaluation = element[Y.ElementProps.evaluation];
    let priority = task[Y.TaskProps.priority];

    // Don’t enqueue evaluation tasks of detached elements:
    if (type === Y.TaskType.Evaluation && element[Y.ElementProps.flags] & Y.ElementFlags.Detached) return;

    // Don’t enqueue evaluation task, if its element has existing evaluation task of higher or equal priority:
    if (type === Y.TaskType.Evaluation && evaluation && evaluation[Y.TaskProps.priority] <= priority) return;

    if (type === Y.TaskType.Evaluation) {
        // If the element has existing evaluation task of lower priority, dequeue it:
        if (evaluation && evaluation[Y.TaskProps.priority] > priority) dequeueTask(root, evaluation);

        element[Y.ElementProps.evaluation] = task;
    }

    if (type === Y.TaskType.Teardown) element[Y.ElementProps.flags] |= Y.ElementFlags.Detached;

    if (DEV) {
        if (priority === X.Priority.Realtime) {
            executeTask(root, task);
        } else {
            enqueueTask(root, task);
        }
    } else {
        // Optimized equivalent of the DEV-branch:
        (priority === X.Priority.Realtime ? executeTask : enqueueTask)(root, task);
    }
}

export function executeTask(root: Y.Root, task: Y.Task): void {
    let type = task[Y.TaskProps.type];

    if (DEV) {
        if (type === Y.TaskType.Evaluation) {
            executeEvaluationTask(root, task as Y.EvaluationTask);
        } else if (type === Y.TaskType.Teardown) {
            executeTeardownTask(root, task as Y.TeardownTask);
        } else if (type === Y.TaskType.Effect) {
            executeEffectTask(root, task as Y.EffectTask<any>);
        } else {
            never(type);
        }
    } else {
        executors[type](root, task as any);
    }

    dequeueTask(root, task);
}

function enqueueTask(root: Y.Root, task: Y.Task): void {
    void root;
    void task;

    throw new NotImplementedError('enqueueTask');
}

function dequeueTask(root: Y.Root, task: Y.Task): void {
    void root;
    void task;

    throw new NotImplementedError('dequeueTask');
}

function executeEvaluationTask(root: Y.Root, task: Y.EvaluationTask): void {
    evaluate(root, task[Y.TaskProps.element]);
}

function executeTeardownTask(root: Y.Root, task: Y.TeardownTask): void {
    teardown(root, task[Y.TaskProps.element]);
}

async function executeEffectTask<p extends readonly any[]>(_: Y.Root, task: Y.EffectTask<p>): Promise<void> {
    // TODO: Handle errors.

    await task[Y.TaskProps.teardown]?.();
    task[Y.TaskProps.teardown] = (await task[Y.TaskProps.setup](...task[Y.TaskProps.params])) || u;
}

const executors = [executeEvaluationTask, executeTeardownTask, executeEffectTask] as const;
