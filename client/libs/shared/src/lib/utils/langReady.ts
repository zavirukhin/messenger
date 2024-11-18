import { inject } from '@angular/core';
import { isEmpty, TranslocoService } from '@jsverse/transloco';
import { filter, map, Observable, of } from 'rxjs';

export function langReady(scope: string): Observable<'loaded'> {
  const translocoService = inject(TranslocoService);

  const translation = translocoService.getTranslation(scope);

  if (!isEmpty(translation)) {
    return of('loaded');
  }

  return translocoService.events$.pipe(
    filter(event => event.type === 'translationLoadSuccess' && event.payload.scope === scope),
    map(() => 'loaded')
  );
}