import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponseDto } from '../../models/auth-response-dto';
import { LoginDto } from '../../models/login-dto';
import { RegisterDto } from '../../models/register-dto';
import { AUTH_API_PATHS, AUTH_TOKEN_KEY } from './auth.constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly apiUrl = environment.apiUrl;

  readonly isLoggedIn = signal(this.hasStoredToken());

  login(credentials: LoginDto): Observable<AuthResponseDto> {
    return this.http
      .post<AuthResponseDto>(`${this.apiUrl}${AUTH_API_PATHS.login}`, credentials)
      .pipe(tap((response) => this.setSession(response)));
  }

  register(user: RegisterDto): Observable<AuthResponseDto> {
    return this.http
      .post<AuthResponseDto>(`${this.apiUrl}${AUTH_API_PATHS.register}`, user)
      .pipe(tap((response) => this.setSession(response)));
  }

  logout(): void {
    this.clearSession();
    void this.router.navigate(['/']);
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  private setSession(response: AuthResponseDto): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    }

    this.isLoggedIn.set(true);
  }

  private clearSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }

    this.isLoggedIn.set(false);
  }

  private hasStoredToken(): boolean {
    return this.getToken() !== null;
  }
}
