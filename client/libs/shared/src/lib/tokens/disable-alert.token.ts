import { HttpContextToken } from '@angular/common/http';

export const DISABLE_ALERT = new HttpContextToken<string[]>(() => []);