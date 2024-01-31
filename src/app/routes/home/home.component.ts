import { Store } from '@ngrx/store'
import { io } from 'socket.io-client'
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router'
import { getToken } from "firebase/messaging";
import { CommonModule } from '@angular/common';
import { Component,OnInit,OnDestroy,inject,Signal,signal,effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Ngrx,Message,Request } from '../../../index.d'
import { RequestService } from '../../services/request/request.service'
import { LastMessageComponent } from '../../components/last-message/last-message.component'
import { ProfilePipe } from '../../pipes/profile/profile.pipe'
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToStringPipe } from '../../pipes/toString/to-string.pipe'
import { AvatarModule } from 'primeng/avatar';
import { CommonService } from '../../services/common/common.service'
import { FirebaseService } from '../../services/firebase/firebase.service'
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
  imports: [
    AvatarModule,
    CommonModule,
    LastMessageComponent,
    ProfilePipe,
    ButtonModule,
    ProgressSpinnerModule,
    ToStringPipe,
  ],
})
export class HomeComponent implements OnInit,OnDestroy{
  socket = io(
    import.meta.env.NG_APP_SERVER
  )
  .on(
    'newMessage',
    this.onNewMessage.bind(this)
  )
  .on(
    'message',
    this.onMessage.bind(this)
  )
  .on(
    'connect',() => {
      this.connected = true
    }
  )
  .on('disconnect',() => {
    this.connected = false
  })
  
  connected = false
  router = inject(Router)
  store = inject(Store<Ngrx.State>)
  requestSvc = inject(RequestService)
  commonService = inject(CommonService)
  firebaseSvc = inject(FirebaseService)

  recentlyMessages = signal<Message.Last[]>([])
  user = toSignal(this.store.select('user'))()

  vapidKey = "BDzXQnX_MM53PtjiHWGsZjJDp5G0Feyr30xMAhtaekR-OdfQXQKFDbAINqjtMx5bCcUBBZ0fIeuF6eiAqbOhOiw"
  
  authorization:string = toSignal(this.store.select('authorization'))()

  fetchRecentlyMessagesState = this.requestSvc.createInitialState<Message.Last[]>()
  
  fetchRecentlyMessagesFn = this.requestSvc.get<Message.Last[]>({
    state:this.fetchRecentlyMessagesState,
    cb:r => this.recentlyMessages.set(r),
    failedCb: e => this.onFailed()
  })

  ngOnInit(){
    var headers = this.commonService.createHeaders({
      authorization:this.commonService.authorizationHeader
    })

    this.fetchRecentlyMessagesFn('message/recently',{
      headers:this.authorization
    })
  }

  onFailed(){
    this.recentlyMessages.set(
      [
        {
          sendAt:1705252055177,
          read:true,
          contentType:'',
          description:'',
          unreadCounter:0,
          value:'halo',
          groupId:'x',
          sender:{
            surname:'Huljannah',
            firstName:'Mifta',
            profileImage:'x',
            usersRef:'x'
          },
          accept:{
            surname:'Huljannah',
            firstName:'Mifta',
            profileImage:'x',
            usersRef:'x'
          }
        }
      ]
    )
  }

  ngOnDestroy(){
    this.socket.disconnect()
  }

  onNewMessage(newMessage:Message.One){
    var _recentlyMessages = this.recentlyMessages()
    var [filter] = _recentlyMessages.filter(message => {
      return (
        message.sender.usersRef
        === newMessage.sender
      ) || (
        message.accept.usersRef
        === newMessage.sender
      )
    })
    

    if(filter && newMessage.accept === this.user._id){
      if(filter.sender.usersRef === String(newMessage.sender)){

        var counter = filter.unreadCounter + 1
        var index = _recentlyMessages.indexOf(
          filter
        )

        _recentlyMessages[index] = {
          ...newMessage,
          sender:filter.sender,
          accept:filter.accept,
          unreadCounter:counter
        }

        this.recentlyMessages.set(
          _recentlyMessages
        )
      }
      if(filter.sender.usersRef === String(newMessage.accept)){
        var index = _recentlyMessages.indexOf(
          filter
        )
        _recentlyMessages[index] = {
          ...newMessage,
          sender:filter.accept,
          accept:filter.sender,
          unreadCounter:1
        }

        this.recentlyMessages.set(
          _recentlyMessages
        )
      }
    }
    else{
      console.log('not on list')
    }
  }

  onMessage(newMessage:Message.Populated){
    if(this.recentlyMessages().filter(e => e._id === newMessage._id).length < 1){
      if(newMessage.accept.usersRef === this.user._id){
        this.recentlyMessages.update((current) => {
          var withCounter = {
            ...newMessage,
            unreadCounter:1
          }

          return [
            withCounter,
            ...current
          ]
        })
      }

     
    }
    else{
      console.log('has been on list')
    }
  }

  retry(){
    (this.fetchRecentlyMessagesState().retryFunction as Function)()
  }
}
