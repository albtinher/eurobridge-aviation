import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ContactLead } from '../models/contact-lead';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);

  sendLead(payload: ContactLead): Observable<void> {
    return this.http.post<{ ok: boolean }>('/api/contact', payload).pipe(map(() => void 0));
  }
}
