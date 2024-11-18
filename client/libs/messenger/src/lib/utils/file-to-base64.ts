import { Observable } from 'rxjs';

export function fileToBase64$(file: File | null): Observable<string> {
  return new Observable<string>((subscription) => {
    if (file === null) {
      subscription.next('');
      subscription.complete();
    }
    else {
      const reader = new FileReader();
      reader.readAsDataURL(file);
  
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          subscription.next(reader.result);
        }
        else {
          subscription.next('');
        }
        subscription.complete();
      };
  
      reader.onerror = () => {
        subscription.error(reader.error);
      }
    }
  });
}