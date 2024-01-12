import { ActionReducer,Reducer,Action,ReducerTypes,ActionCreator,TypedAction,FunctionWithParametersType,ActionCreatorProps } from '@ngrx/store';
import { HttpErrorResponse,HttpEvent } from '@angular/common/http';
import { WritableSignal } from '@angular/core';


export interface User {
  _id:string|null,
  profile:Profile|null,
}

export interface Authenticated{
  _id:string,
  profile:Profile,
  authorization:string
}

export interface Authentication{
  loggedIn:boolean
}

export interface State {
  authentication:Authentication,
  authorization:string,
  user:User
}


export interface Profile{
  surname:string,
  profileImage:string,
  firstName:string,
}

export interface Credential {
  username:string,
  password:string
}

export namespace Message{
  interface Last{
    sendAt:number,
    read:boolean,
    contentType:string,
    description:string,
    unreadCounter:number
    value:string,
    groupId:string,
    sender:Profile & {
      usersRef:string
    },
    accept:Profile & {
      usersRef:string
    }
  }
}


export namespace Request{

  type Get = (path:string,options?:any) => void

  type Post<Body> = (body:Body,options?:any) => void

  type State<T> = WritableSignal<RequestState<T>>

  interface RequestConfig<Result>{
    cb?:(result:Result) => void,
    failedCb?:(err:HttpErrorResponse)=>void,
    state:State<Result>,
    path?:string
  }

  export interface RequestState<Result>{
    retryFunction?:() => void,
    running:boolean,
    error?:HttpErrorResponse,
    result?:Result
  }

}

