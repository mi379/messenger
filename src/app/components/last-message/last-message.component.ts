import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { Component,Input } from '@angular/core';
import { Common } from '../../../index.d'
import { ChipModule } from 'primeng/chip';
import { ToIntPipe } from '../../pipes/toInt/to-int.pipe'
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { AvatarGroupModule } from 'primeng/avatargroup';

@Component({
  selector: 'app-last-message',
  standalone: true,
  templateUrl: './last-message.component.html',
  styleUrl: './last-message.component.css',
  imports: [
    AvatarModule,
    BadgeModule,
    AvatarGroupModule,
    CommonModule,
    RouterLink,
    ToIntPipe
  ],

})
export class LastMessageComponent {
  @Input() profile!:Common.Profile
  @Input() value!:string
  @Input() unread!:boolean
  @Input() unreadCounter!:string
  @Input() groupId!:string
  @Input() contentType!:string

  count(counter:string):number{
    return parseInt(
      counter
    )
  }
}
