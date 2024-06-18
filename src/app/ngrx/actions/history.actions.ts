import { createAction, props } from "@ngrx/store";
import { Message, Ngrx } from "../../..";

export const add = createAction('[History Component] Add',props<{v:Ngrx.History}>())
export const replace = createAction('[History Component] Replace',props<{index:number,value:Message.Last}>())
export const successSend = createAction('[History Component] Success Send',props<{index:number}>())
export const updated = createAction('[History Component] Updated',props<{index:number}>())
export const failedSend = createAction('[History Component] Failed Send',props<{index:number}>())
export const resend = createAction('[History Component] Resend',props<{index:number}>())
export const resetCounter = createAction('[History Component] Reset Counter',props<{index:number}>())