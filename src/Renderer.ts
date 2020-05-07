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
            InstructionCode = 0,
            NativeType = 1,
            OldElement = 1,
            ParentElement = 1,
            PreviousSiblingElement = 1,
            NewElement = 2,
            TargetElement = 1,
            AttributeName = 2,
            AttributeValue = 3,
        }

        export interface BaseInstruction<t extends InstructionCode> {
            [InstructionProps.InstructionCode]: t;
        }

        export interface CreateNodeInstruction extends BaseInstruction<InstructionCode.CreateNode> {
            [InstructionProps.NativeType]: NativeType;
        }

        export interface ReplaceNodeInstruction<d> extends BaseInstruction<InstructionCode.ReplaceNode> {
            [InstructionProps.OldElement]: Pointer<d>;
            [InstructionProps.NewElement]: Pointer<d>;
        }

        export interface RemoveNodeInstruction<d> extends BaseInstruction<InstructionCode.RemoveNode> {
            [InstructionProps.OldElement]: Pointer<d>;
        }

        export interface PrependNodeInstruction<d> extends BaseInstruction<InstructionCode.PrependNode> {
            [InstructionProps.ParentElement]: Pointer<d>;
            [InstructionProps.NewElement]: Pointer<d>;
        }

        export interface InsertAfterNodeInstruction<d> extends BaseInstruction<InstructionCode.InsertAfterNode> {
            [InstructionProps.PreviousSiblingElement]: Pointer<d>;
            [InstructionProps.NewElement]: Pointer<d>;
        }

        export interface SetAttributeInstruction<d> extends BaseInstruction<InstructionCode.SetAttribute> {
            [InstructionProps.TargetElement]: Pointer<d>;
            [InstructionProps.AttributeName]: any;
            [InstructionProps.AttributeValue]: any;
        }

        export interface RemoveAttributeInstruction<d> extends BaseInstruction<InstructionCode.RemoveAttribute> {
            [InstructionProps.TargetElement]: Pointer<d>;
            [InstructionProps.AttributeName]: any;
        }
    }

    export namespace Y {
        export const enum InstructionCode {
            CreateNode = 1,
            ReplaceNode = 2,
            RemoveNode = 3,

            PrependOrInsertAfterNode = 4,

            SetAttribute = 5,
            RemoveAttribute = 6,
        }

        export type Instruction =
            | CreateNodeInstruction
            | ReplaceNodeInstruction
            | RemoveNodeInstruction
            | PrependOrInsertAfterNodeInstruction
            | SetAttributeInstruction
            | RemoveAttributeInstruction;

        export const enum BaseInstructionProps {
            InstructionCode = 0,
        }

        export interface BaseInstruction<t extends InstructionCode> {
            [BaseInstructionProps.InstructionCode]: t;
        }

        export const enum CreateNodeInstructionProps {
            NativeType = 1,
        }

        export interface CreateNodeInstruction extends BaseInstruction<InstructionCode.CreateNode> {
            [CreateNodeInstructionProps.NativeType]: X.NativeType;
        }

        export const enum ReplaceNodeInstructionProps {
            OldElement = 1,
            NewElement = 2,
        }

        export interface ReplaceNodeInstruction extends BaseInstruction<InstructionCode.ReplaceNode> {
            [ReplaceNodeInstructionProps.OldElement]: Element;
            [ReplaceNodeInstructionProps.NewElement]: Element;
        }

        export const enum RemoveNodeInstructionProps {
            OldElement = 1,
        }

        export interface RemoveNodeInstruction extends BaseInstruction<InstructionCode.RemoveNode> {
            [RemoveNodeInstructionProps.OldElement]: Element;
        }

        export const enum PrependOrInsertAfterNodeInstructionProps {
            ParentElement = 1,
            PreviousSiblingElement = 2,
            NewElement = 3,
        }

        export interface PrependOrInsertAfterNodeInstruction extends BaseInstruction<InstructionCode.PrependOrInsertAfterNode> {
            [PrependOrInsertAfterNodeInstructionProps.ParentElement]: Element;
            [PrependOrInsertAfterNodeInstructionProps.PreviousSiblingElement]: Element;
            [PrependOrInsertAfterNodeInstructionProps.NewElement]: Element;
        }

        export const enum SetAttributeInstructionProps {
            TargetElement = 1,
            AttributeName = 2,
            AttributeValue = 3,
        }

        export interface SetAttributeInstruction extends BaseInstruction<InstructionCode.SetAttribute> {
            [SetAttributeInstructionProps.TargetElement]: Element;
            [SetAttributeInstructionProps.AttributeName]: any;
            [SetAttributeInstructionProps.AttributeValue]: any;
        }

        export const enum RemoveAttributeInstructionProps {
            TargetElement = 1,
            AttributeName = 2,
        }

        export interface RemoveAttributeInstruction extends BaseInstruction<InstructionCode.RemoveAttribute> {
            [RemoveAttributeInstructionProps.TargetElement]: Element;
            [RemoveAttributeInstructionProps.AttributeName]: any;
        }
    }
}
