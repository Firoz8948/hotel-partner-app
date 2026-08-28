import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  user_id: number;
  full_name: string;
  phone?: string;
  role: string;
  access_token: string;
  redirect_to: string;
  restaurant_id?: number;
  restaurant_name?: string;
  impersonated_by?: number;
  impersonation_session_id?: string;
  legal_terms_version?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiBaseUrl}/auth`;
  readonly currentUser = signal<AuthUser | null>(this.loadFromStorage());
  readonly isLoggedIn = computed(() => !!this.currentUser());

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  sendOTP(phone: string, role: string) {
    return this.http.post(`${this.apiUrl}/send-otp`, { phone, role });
  }

  verifyOTP(
    phone: string,
    otp_code: string,
    role: string,
    accepted_legal: boolean,
    full_name?: string,
  ) {
    return this.http.post<AuthUser>(`${this.apiUrl}/verify-otp`, {
      phone,
      otp_code,
      role,
      full_name,
      accepted_legal,
      legal_version: '2026-08-17',
    }).pipe(tap((user) => this.saveSession(user)));
  }

  partnerLogin(
    username: string,
    password: string,
    role: string,
    accepted_legal: boolean,
  ) {
    return this.http.post<AuthUser>(`${this.apiUrl}/partner-login`, {
      username,
      password,
      role,
      accepted_legal,
      legal_version: '2026-08-17',
    }).pipe(tap((user) => this.saveSession(user)));
  }

  saveSession(user: AuthUser): void {
    localStorage.setItem(environment.userKey, JSON.stringify(user));
    localStorage.setItem(environment.tokenKey, user.access_token);
    this.currentUser.set(user);
  }

  saveTokenDirectly(token: string, role = 'restaurant_owner'): void {
    const user: AuthUser = {
      access_token: token,
      role: role,
      user_id: 0,
      full_name: 'Hotel Partner',
      redirect_to: '/hotel-portal/dashboard',
    };
    this.saveSession(user);
  }

  logout(): void {
    localStorage.removeItem('le_admin_backup');
    localStorage.removeItem(environment.userKey);
    localStorage.removeItem(environment.tokenKey);
    this.currentUser.set(null);
    void this.router.navigateByUrl('/hotel-portal/login');
  }

  getToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  hasRole(role: string): boolean {
    return this.currentUser()?.role === role;
  }

  isRestaurantImpersonating(): boolean {
    return !!localStorage.getItem('le_admin_backup')
      && this.currentUser()?.role === 'restaurant_owner';
  }

  exitRestaurantImpersonation(): boolean {
    try {
      const raw = localStorage.getItem('le_admin_backup');
      if (!raw) return false;
      const backup = JSON.parse(raw) as AuthUser;
      localStorage.removeItem('le_admin_backup');
      this.saveSession(backup);
      return true;
    } catch {
      return false;
    }
  }

  private loadFromStorage(): AuthUser | null {
    try {
      const data = localStorage.getItem(environment.userKey);
      return data ? JSON.parse(data) as AuthUser : null;
    } catch {
      return null;
    }
  }
}
