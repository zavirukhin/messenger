import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { AsyncPipe, CommonModule, NgForOf } from '@angular/common';
import { ContactsService } from '../../services/contacts/contacts.service';
import { distinctUntilChanged, Observable, of, Subject, take } from 'rxjs';
import { ProfileResponse } from '../../interfaces/profile-response.interface';
import {
  TuiAlertService,
  TuiButton,
  TuiFallbackSrcPipe,
  TuiFormatNumberPipe
} from '@taiga-ui/core';
import { TuiAvatar, TuiAvatarLabeled } from '@taiga-ui/kit';
import { RouterLink } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TuiInputModule } from '@taiga-ui/legacy';
import { Users } from '../../interfaces/users.interface';
import { ProfileService } from '../../services/profile/profile.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    RouterLink,
    TranslocoDirective,
    ReactiveFormsModule,
    TuiInputModule
  ],
  templateUrl: './contacts-page.component.html',
  styleUrl: './contacts-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactsPageComponent implements OnInit {
  public contacts$: Observable<ProfileResponse[]> = of([]);
  public columns: string[] = ['avatar', 'firstName', 'lastName'];
  public listUsers: Users[] = [];
  private readonly tuiAlertsService = inject(TuiAlertService);
  private readonly queue$ = new Subject<Observable<unknown>>();
  private readonly profileService = inject(ProfileService);
  protected testForm = new FormGroup({
    testValue: new FormControl('', Validators.required)
  });

  constructor(
    private readonly contactsService: ContactsService,
    private transloco: TranslocoService
  ) {
    this.queue$.pipe(takeUntilDestroyed()).subscribe();
  }

  ngOnInit(): void {
    this.loadContacts();
    this.contactsService
      .getFullListUser$()
      .subscribe((data) => (this.listUsers = data)),
      take(1);
  }

  private loadContacts(): void {
    this.contacts$ = this.contactsService.getContacts$();
  }

  public addContact(): void {
    let alertMessage = this.transloco.translate('messenger.userDoesNotExist');
    let oops = this.transloco.translate('messenger.oops');
    this.listUsers.forEach((user) => {
      if (
        this.testForm.value.testValue &&
        (String(user.id) === this.testForm.value.testValue ||
          String(user.phone) === this.testForm.value.testValue ||
          String(user.customName) === this.testForm.value.testValue)
      ) {
        alertMessage = this.transloco.translate('messenger.addingContact');
        oops = this.transloco.translate('messenger.hooray');
        this.profileService.addToContact(+user.id).subscribe(() => {
          this.loadContacts();
        });

        return;
      }
    });
    this.tuiAlertsService
      .open(alertMessage, {
        label: oops
      })
      .pipe(distinctUntilChanged())
      .subscribe(),
      take(1);
  }
}
