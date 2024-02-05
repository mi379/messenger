import { Component,Input } from '@angular/core';
import { Message,Ngrx } from '../../../index.d'
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-sent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-sent.component.html',
  styleUrl: './message-sent.component.css'
})
export class MessageSentComponent {
  @Input() message!:Message.One
}
