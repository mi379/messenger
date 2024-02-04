import { Store } from '@ngrx/store'
import { Types } from 'mongoose';
import { io } from 'socket.io-client'
import { Component,OnInit,OnDestroy,inject,signal,effect } from '@angular/core';
import { Common } from '../../../index.d'
import { ActivatedRoute,Router,Params } from '@angular/router'
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CommonModule,Location } from '@angular/common';
import { Message,Ngrx } from '../../../index.d'
import { RequestService } from '../../services/request/request.service'
import { CommonService } from '../../services/common/common.service'
import { HttpHeaders } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputGroupModule } from 'primeng/inputgroup';
import { FormControl,FormGroup, ReactiveFormsModule } from '@angular/forms';



@Component({
  selector: 'app-message',
  standalone: true,
  templateUrl: './message.component.html',
  styleUrl: './message.component.css',
  imports: [
    AvatarModule,
    ButtonModule,
    ProgressSpinnerModule,
    CommonModule,
    InputGroupModule,
    ReactiveFormsModule
  ]
})
export class MessageComponent implements OnInit,OnDestroy {


  router   = inject(Router)
  route    = inject(ActivatedRoute)
  location = inject(Location)
  request  = inject(RequestService)
  store    = inject(Store<Ngrx.State>)
  common   = inject(CommonService)
  
  socket = io(import.meta.env.NG_APP_SERVER)

  user = toSignal(this.store.select('user'))()
  pageState:PageState = window.history.state
  _id = this.route.snapshot.params['_id']
  authorization = toSignal(
    this.store.select('authorization')
  )()

  /**
   * fetch all message result
   */
  
  messages = signal<Message.All>([])
  
  /**
   * new message form
   */

  newMessage:FormGroup = new FormGroup({
    value:new FormControl<string>(''),
    groupId:new FormControl<string>(
      this.pageState.groupId
    ),
    accept:new FormControl<string>(
      this._id
    )
  })

  /**
   * request state and function
   */

  fetchAllMessageState = this.request.createInitialState<Message.All>()
  sendMessageState = this.request.createInitialState<Message.One>()
  updateOnReadState = this.request.createInitialState<Message.One>()

  sendNewMessage = this.request.post<Message.New,Message.One>({
    cb:r => this.onSuccessSend(r._id),
    failedCb:r => console.log(r),
    state:this.sendMessageState,
    path:'message'
  })

  fetchAllMessageFn = this.request.get<Message.All>({
    cb:r => this.onSuccessFetch(r),
    state:this.fetchAllMessageState,
    failedCb: e => console.log(e),
  })

  updateOnReadFn = this.request.put<Message.Update,Message.One>({
    cb:r => console.log(r),
    failedCb:r => console.log(r),
    state:this.updateOnReadState,
    path:'message'
  })

  /**
   * implements on init
   */

  ngOnInit(){
    var headers = new HttpHeaders({
      authorization:this.authorization
    })

    this.fetchAllMessageFn(`message/all/${this._id}`,{
      headers
    })
  }

  ngOnDestroy(){
    this.socket.disconnect()
  }
  
  /**
   * is valid current message input
   */

  isValid(message:string):boolean{
    var regex = /^\s*$/;
    return regex.test(
      message
    ) 
  }

  /**
   * - add new message to message list
   * - trigger send message http function
   */

  send(){
    var now = Date.now()
    var _id = new Types.ObjectId()

    var newMessage:Message.One = {
      ...this.newMessage.value,
      sender:this.user._id,
      _id:_id.toString(),
      sendAt:now,
      sent:false,
      read:false,
      contentType:'',
      description:'',
    }

    var sendObject:Message.New = {
      ...this.newMessage.value,
      _id:_id.toString(),
      sendAt:now
    }

    this.messages.update(current => {
      return [
         ...current,
         newMessage
      ]
    })

    var headers = new HttpHeaders({
      authorization:this.authorization
    })

    this.sendNewMessage(
      sendObject,
      {headers}
    )
  }

  /**
   * update message status on sent
   */

  onSuccessSend(_id:string){
    var _messages = this.messages()
    var [filter] = this.messages().filter(
      f => f._id === _id
    )

    var index = _messages.indexOf(filter)
    _messages[index] = {
      ...filter,
      sent:true
    }

    this.messages.set(_messages)
  }

  onSuccessFetch(messages:Message.All){
    var unread = messages.filter(
      x => 
        x.read === false &&
        x.sender === this._id
    )

    unread.map((unreadMessage) => {
      var {_id} = unreadMessage
      this.updateOnReadFn({
        _id
      })
    })

    var _messages = messages.map(x => {
       return {
        ...x,
        sent:true
       }
    })

    this.messages.set(
       _messages
    )
  }

  onNewMessage = this.socket.on('newMessage',(message:Message.One) => {
    if(message.accept === this.user._id && message.sender === this._id){
      this.updateOnReadFn({_id:message._id})
      this.messages.update((current) => {
        return [
          ...current,{
            ...message,
            sent:true,
            read:true
          }
        ]
      })
    }
  })
  
  // onNewMessage(message:Message.One){
  //   if(message.accept === this.user._id && message.sender === this._id){
  //     this.updateOnReadFn({_id:message._id})
  //     this.messages.update((current) => {
  //       return [
  //         ...current,{
  //           ...message,
  //           sent:true,
  //           read:true
  //         }
  //       ]
  //     })
  //   }
  // }

  onUpdated = this.socket.on('updated',(_id:string) => {
    var _messages = this.messages()
    var [filter] = _messages.filter(x => {
      return _id === x._id
    })

    var index = _messages.indexOf(filter)

    _messages[index] = {
      ...filter,
      read:true
    }

    this.messages.set(
      _messages
    )
  })

  onConnected = this.socket.on('connect',() => {
    var _id = this.user._id
    var groupId = this.pageState.groupId
    var roomId = `${groupId}/${_id}`

    this.socket.emit(
      'join',
      roomId
    )
  })

  // onUpdated(_id:string){
  //   var _messages = this.messages()
  //   var [filter] = _messages.filter(x => {
  //     return _id === x._id
  //   })

  //   var index = _messages.indexOf(filter)

  //   _messages[index] = {
  //     ...filter,
  //     read:true
  //   }

  //   this.messages.set(
  //     _messages
  //   )
  // }

  retry(){
    (this.fetchAllMessageState().retryFunction as Function)()
  }
}

interface PageState{
  profile:Common.Profile,
  groupId:string
}