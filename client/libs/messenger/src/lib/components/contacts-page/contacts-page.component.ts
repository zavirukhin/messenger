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
import { TuiAvatar, TuiAvatarLabeled, TuiButtonLoading } from '@taiga-ui/kit';
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
    TuiInputModule,
    TuiButtonLoading
  ],
  templateUrl: './contacts-page.component.html',
  styleUrl: './contacts-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactsPageComponent implements OnInit {
  public contacts$: Observable<ProfileResponse[]> = of([]);
  public columns: string[] = ['avatar', 'firstName', 'lastName'];
  public listUsers: Users[] = [];
  public profile: ProfileResponse | null = null;
  public loading = false;
  private readonly tuiAlertsService = inject(TuiAlertService);
  private readonly queue$ = new Subject<Observable<unknown>>();
  private readonly profileService = inject(ProfileService);
  public contacts: ProfileResponse[] = [];
  protected form = new FormGroup({
    search: new FormControl('', Validators.required)
  });
  constructor(
    private readonly contactsService: ContactsService,
    private transloco: TranslocoService
  ) {}

  ngOnInit(): void {
    this.loadContacts();
    this.contactsService
      .getFullListUser$()
      .pipe(take(1))
      .subscribe((data) => (this.listUsers = data));
    this.profileService
      .getProfile$()
      .pipe(take(1))
      .subscribe((data) => {
        this.profile = data;
      });
    this.contacts$.pipe(take(1)).subscribe((data) => (this.contacts = data));
  }

  private loadContacts(): void {
    this.contacts$ = this.contactsService.getContacts$();
  }

  public addContact(): void {
    let alertMessage = this.transloco.translate('messenger.userDoesNotExist');
    let oops = this.transloco.translate('messenger.oops');
    this.loading = true;
    this.listUsers.forEach((user) => {
      const isExistUser =
        this.form.value.search &&
        this.form.value.search &&
        this.profile &&
        !this.contacts.find((contact) => contact.id === user.id) &&
        (String(user.id) === this.form.value.search ||
          String(user.phone) === this.form.value.search ||
          String(user.customName) === this.form.value.search) &&
        (String(this.profile.id) !== this.form.value.search ||
          String(this.profile.customName) === this.form.value.search ||
          (String(user.phone) === this.form.value.search &&
            user.id !== this.profile.id));

      if (isExistUser) {
        alertMessage = this.transloco.translate('messenger.addingContact');
        oops = this.transloco.translate('messenger.hooray');
        this.profileService
          .addToContact$(+user.id)
          .pipe(take(1))
          .subscribe(() => {
            this.loadContacts();
            this.contacts$
              .pipe(take(1))
              .subscribe((data) => (this.contacts = data));
            this.loading = false;
          });

        return;
      } else {
        this.loading = false;
      }
    });
    this.form.setValue({ search: '' });
    this.tuiAlertsService
      .open(alertMessage, {
        label: oops
      })
      .pipe(distinctUntilChanged(), take(1))
      .subscribe();
  }
}
