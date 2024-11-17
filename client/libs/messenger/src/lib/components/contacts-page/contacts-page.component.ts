import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule, NgForOf } from '@angular/common';
import { ContactsService } from '../../services/contacts/contacts.service';
import { Observable, of } from 'rxjs';
import { ProfileResponse } from '../../interfaces/profile-response.interface';
import {
  TuiButton,
  TuiFallbackSrcPipe,
  TuiFormatNumberPipe
} from '@taiga-ui/core';
import { TuiAvatar, TuiAvatarLabeled } from '@taiga-ui/kit';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lib-contacts-page',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    NgForOf,
    TuiFormatNumberPipe,
    TuiAvatar,
    TuiAvatarLabeled,
    TuiFallbackSrcPipe,
    TuiButton,
    RouterLink
  ],
  templateUrl: './contacts-page.component.html',
  styleUrl: './contacts-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactsPageComponent implements OnInit {
  public contacts$: Observable<ProfileResponse[]> = of([]);
  public columns: string[] = ['avatar', 'firstName', 'lastName'];

  constructor(private readonly contactsService: ContactsService) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  private loadContacts(): void {
    this.contacts$ = this.contactsService.getContacts();
  }
}
