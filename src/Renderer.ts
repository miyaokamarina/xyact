import { Pointer } from './Prelude';

declare module './Xyact' {
    export namespace X {
        export const enum InstructionCode {
            CreateNode = 1,
            ReplaceNode = 2,
            RemoveNode = 3,

            PrependNode = 4,
            InsertAfterNode = 5,

            SetAttribute = 6,
            RemoveAttribute = 7,
        }

        export type Instruction<d> =
            | CreateNodeInstruction
            | ReplaceNodeInstruction<d>
            | RemoveNodeInstruction<d>
            | PrependNodeInstruction<d>
            | InsertAfterNodeInstruction<d>
            | SetAttributeInstruction<d>
            | RemoveAttributeInstruction<d>;

        export const enum InstructionProps {
            instructionCode = 0,
            nativeType = 1,
            oldElement = 1,
            parentElement = 1,
            previousSiblingElement = 1,
            newElement = 2,
            targetElement = 1,
            attributeName = 2,
            attributeValue = 3,
        }

        export interface BaseInstruction<t extends InstructionCode> {
            [InstructionProps.instructionCode]: t;
        }

        export interface CreateNodeInstruction extends BaseInstruction<InstructionCode.CreateNode> {
            [InstructionProps.nativeType]: NativeType;
        }

        export interface ReplaceNodeInstruction<d> extends BaseInstruction<InstructionCode.ReplaceNode> {
            [InstructionProps.oldElement]: Pointer<d>;
            [InstructionProps.newElement]: Pointer<d>;
        }

        export interface RemoveNodeInstruction<d> extends BaseInstruction<InstructionCode.RemoveNode> {
            [InstructionProps.oldElement]: Pointer<d>;
        }

        export interface PrependNodeInstruction<d> extends BaseInstruction<InstructionCode.PrependNode> {
            [InstructionProps.parentElement]: Pointer<d>;
            [InstructionProps.newElement]: Pointer<d>;
        }

        export interface InsertAfterNodeInstruction<d> extends BaseInstruction<InstructionCode.InsertAfterNode> {
            [InstructionProps.previousSiblingElement]: Pointer<d>;
            [InstructionProps.newElement]: Pointer<d>;
        }

        export interface SetAttributeInstruction<d> extends BaseInstruction<InstructionCode.SetAttribute> {
            [InstructionProps.targetElement]: Pointer<d>;
            [InstructionProps.attributeName]: any;
            [InstructionProps.attributeValue]: any;
        }

        export interface RemoveAttributeInstruction<d> extends BaseInstruction<InstructionCode.RemoveAttribute> {
            [InstructionProps.targetElement]: Pointer<d>;
            [InstructionProps.attributeName]: any;
        }
    }

    export namespace Y {
        export const enum InstructionCode {
            CreateNode = 1,
            ReplaceNode = 2,
            RemoveNode = 3,

            PreinsNode = 4,

            SetAttribute = 5,
            RemoveAttribute = 6,
        }

        export type Instruction =
            | CreateNodeInstruction
            | ReplaceNodeInstruction
            | RemoveNodeInstruction
            | PreinsNodeInstruction
            | SetAttributeInstruction
            | RemoveAttributeInstruction;

        export const enum BaseInstructionProps {
            instructionCode = 0,
        }

        export interface BaseInstruction<t extends InstructionCode> {
            [BaseInstructionProps.instructionCode]: t;
        }

        export const enum CreateNodeInstructionProps {
            element = 1,
        }

        export interface CreateNodeInstruction extends BaseInstruction<InstructionCode.CreateNode> {
            [CreateNodeInstructionProps.element]: Element;
        }

        export const enum ReplaceNodeInstructionProps {
            oldElement = 1,
            newElement = 2,
        }

        export interface ReplaceNodeInstruction extends BaseInstruction<InstructionCode.ReplaceNode> {
            [ReplaceNodeInstructionProps.oldElement]: Element;
            [ReplaceNodeInstructionProps.newElement]: Element;
        }

        export const enum RemoveNodeInstructionProps {
            oldElement = 1,
        }

        export interface RemoveNodeInstruction extends BaseInstruction<InstructionCode.RemoveNode> {
            [RemoveNodeInstructionProps.oldElement]: Element;
        }

        export const enum PreinsNodeInstructionProps {
            parentElement = 1,
            previousSiblingElement = 2,
            newElement = 3,
        }

        export interface PreinsNodeInstruction extends BaseInstruction<InstructionCode.PreinsNode> {
            [PreinsNodeInstructionProps.parentElement]: Element;
            [PreinsNodeInstructionProps.previousSiblingElement]: Element | undefined;
            [PreinsNodeInstructionProps.newElement]: Element;
        }

        export const enum SetAttributeInstructionProps {
            targetElement = 1,
            attributeName = 2,
            attributeValue = 3,
        }

        export interface SetAttributeInstruction extends BaseInstruction<InstructionCode.SetAttribute> {
            [SetAttributeInstructionProps.targetElement]: Element;
            [SetAttributeInstructionProps.attributeName]: any;
            [SetAttributeInstructionProps.attributeValue]: any;
        }

        export const enum RemoveAttributeInstructionProps {
            targetElement = 1,
            attributeName = 2,
        }

        export interface RemoveAttributeInstruction extends BaseInstruction<InstructionCode.RemoveAttribute> {
            [RemoveAttributeInstructionProps.targetElement]: Element;
            [RemoveAttributeInstructionProps.attributeName]: any;
        }
    }
}
