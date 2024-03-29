import { createReducer,on } from '@ngrx/store';
import { setAuthorization,reset } from '../actions/authorization.actions';

var state = JSON.parse(localStorage.getItem("ngrx") as string)

export const authorizationReducer = createReducer<string>(
  state?.authorization ?? '',

  on(setAuthorization,(state:string,{authorization}) => {
    return `Bearer ${authorization}`
  }),

  on(reset,(state:string) => {
    return ''
  })
);
