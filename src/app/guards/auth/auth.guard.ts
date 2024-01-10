import { inject,Signal } from '@angular/core';
import { State } from '../../../index.d'
import { Store } from '@ngrx/store'
import { toSignal } from '@angular/core/rxjs-interop';
import { CanActivateFn,Router,ActivatedRouteSnapshot,RouterStateSnapshot } from '@angular/router';


export const authGuard = (route:ActivatedRouteSnapshot,state:RouterStateSnapshot):boolean => {
  const router= inject(Router)
  const store = inject(Store<State>)
  const auth = toSignal(store.select('auth'))()

  var loggedIn = auth.loggedIn ?? false
  var onLoginPage = state.url === '/login'
  var onHomePage = state.url === '/'
  var onMessagePage = state.url === '/message'
 
  if(!loggedIn && (onHomePage || onMessagePage)){
    router.navigate(['login'])
  }
  
  if(loggedIn && onLoginPage) {
    router.navigate([''])
  }

  return loggedIn 
    ? onLoginPage 
      ? false : true 
    : onHomePage || onMessagePage
      ? false : true
};
