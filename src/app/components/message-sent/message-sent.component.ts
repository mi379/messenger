import { Component,Input,ViewEncapsulation,inject,Output,EventEmitter } from '@angular/core';
import { CommonService } from '../../services/common/common.service'
import { Message,Ngrx } from '../../../index.d'
import { CommonModule } from '@angular/common';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-message-sent',
  standalone: true,
  imports: [CommonModule,ImageModule],
  templateUrl: './message-sent.component.html',
  styleUrl: './message-sent.component.css',
})
export class MessageSentComponent {
  common = inject(CommonService)

  @Input() isLast!:boolean
  
  @Input() message!:Message.One
  
  @Output() resend = new EventEmitter<Message.One>()
}
