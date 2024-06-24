import { Injectable,inject,effect, Signal, EffectRef } from '@angular/core';
import { Message, Ngrx } from '../../../index.d'
import { Store } from '@ngrx/store'
import { toSignal } from '@angular/core/rxjs-interop';


@Injectable({
  providedIn: 'root'
})
export class StoreService {
  rootInit = false
  store = inject(Store<Ngrx.State>)
  user = toSignal(this.store.select('user')) as Signal<Ngrx.User>
  authorization = toSignal(this.store.select('authorization')) as Signal<string>
  authentication = toSignal(this.store.select('authentication')) as Signal<Ngrx.Authentication>
  messages = toSignal(this.store.select('messages')) as Signal<Ngrx.Messages[]>
  history = toSignal(this.store.select('history')) as Signal<Ngrx.History>

  syncWithLocalStorage:EffectRef = effect(() => {
    var authentication = this.authentication()
    var authorization = this.authorization()
    var history = this.history()
    var messages = this.messages()
    var user = this.user()

    var jsonState = JSON.stringify({
      authentication,
      authorization,
      history,
      messages,
      user,
    })

    
    if(this.rootInit){
      if(JSON.parse(localStorage.getItem("ngrx") as string)){
        localStorage.removeItem("ngrx")
        localStorage.setItem(
          "ngrx",
          jsonState
        )
      }
      else{
        localStorage.setItem(
          "ngrx",
          jsonState
        )
      }
    }
  })

  init(){
    this.rootInit = true
  }
}
