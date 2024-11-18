import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TuiBadge, TuiBadgedContent, TuiButtonSelect } from '@taiga-ui/kit';
import {
  TuiButton,
  TuiDataList,
  TuiFlagPipe,
  TuiTextfield
} from '@taiga-ui/core';
import { TUI_DOC_ICONS } from '@taiga-ui/addon-doc/tokens';
import { MultilingualService } from '../services/multilingual.service';
import type { TuiCountryIsoCode, TuiLanguageName } from '@taiga-ui/i18n/types';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { CountryCode, Language } from '../models/multilingual-type';

@Component({
  selector: 'lib-app-multilingual',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TitleCasePipe,
    TuiBadge,
    TuiBadgedContent,
    TuiButton,
    TuiButtonSelect,
    TuiDataList,
    TuiFlagPipe,
    TuiTextfield,
    TranslocoDirective
  ],
  templateUrl: './multilingual.component.html',
  styleUrl: './multilingual.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultilingualComponent {
  protected readonly icons = inject(TUI_DOC_ICONS);

  private readonly translocoService = inject(TranslocoService);
  protected readonly switcher = inject(MultilingualService);
  protected readonly languageControl  = new FormControl(
      this.switcher.getLanguageFromLocalStorage() ||
        this.translocoService.getDefaultLang()
  );

  public readonly flagsMap = new Map<TuiLanguageName, TuiCountryIsoCode>([
    [Language.English, CountryCode.GB],
    [Language.Russian, CountryCode.RU]
  ]);

  public readonly names: TuiLanguageName[] = Array.from(this.flagsMap.keys());

  public setLang(lang: string): void {
    this.languageControl .setValue(lang);
    this.switcher.saveLanguageToLocalStorage(lang);
    this.translocoService.setActiveLang(lang);
  }
}
