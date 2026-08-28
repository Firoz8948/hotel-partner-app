import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ImpersonationExitResponse {
  ok: boolean;
  ended_at: string | null;
}

@Injectable({ providedIn: 'root' })
export class ImpersonationExitService {
  private readonly endpoint =
    `${environment.apiBaseUrl}/admin/impersonation/exit`;

  constructor(private readonly http: HttpClient) {}

  exit(): Observable<ImpersonationExitResponse> {
    return this.http.post<ImpersonationExitResponse>(this.endpoint, {});
  }
}
