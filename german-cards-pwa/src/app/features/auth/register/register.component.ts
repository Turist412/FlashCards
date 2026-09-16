import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="min-h-screen bg-stone-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">
      <div class="mx-auto flex min-h-[calc(100vh-3rem)] max-w-2xl items-center">
        <div class="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <header class="mb-8"><p class="mb-2 text-sm font-semibold uppercase tracking-widest text-teal-700">German Cards</p><h1 class="text-3xl font-bold tracking-tight text-slate-950">Регистрация</h1><p class="mt-3 text-base leading-6 text-slate-600">Создайте аккаунт для своих колод и карточек.</p></header>
          <form class="space-y-5" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
            @if (errorMessage(); as message) { <p class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">{{ message }}</p> }
            <label class="block text-base font-semibold text-slate-800" for="user-name">Имя пользователя<input id="user-name" class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100" type="text" formControlName="userName" autocomplete="username" /></label>
            @if (form.controls.userName.touched && form.controls.userName.invalid) { <p class="-mt-3 text-sm text-red-700">Введите имя пользователя.</p> }
            <label class="block text-base font-semibold text-slate-800" for="email">Email<input id="email" class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100" type="email" formControlName="email" autocomplete="email" /></label>
            @if (form.controls.email.touched && form.controls.email.invalid) { <p class="-mt-3 text-sm text-red-700">Введите корректный email.</p> }
            <label class="block text-base font-semibold text-slate-800" for="password">Пароль<input id="password" class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100" type="password" formControlName="password" autocomplete="new-password" /></label>
            @if (form.controls.password.touched && form.controls.password.invalid) { <p class="-mt-3 text-sm text-red-700">Пароль должен содержать не менее 6 символов.</p> }
            <button class="w-full rounded-lg bg-teal-700 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-teal-400" type="submit" [disabled]="isSubmitting()">{{ isSubmitting() ? 'Создаём...' : 'Создать аккаунт' }}</button>
          </form>
          <p class="mt-6 text-center text-base text-slate-600">Уже есть аккаунт? <a routerLink="/login" class="font-semibold text-teal-700 hover:text-teal-900">Войти</a></p>
        </div>
      </div>
    </main>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly form = this.fb.nonNullable.group({
    userName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) { this.form.markAllAsTouched(); return; }
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.form.disable();
    this.authService.register(this.form.getRawValue()).pipe(finalize(() => { this.isSubmitting.set(false); this.form.enable(); })).subscribe({ next: () => void this.router.navigate(['/decks']), error: (error) => this.errorMessage.set(typeof error.error === 'string' ? error.error : 'Не удалось создать аккаунт. Повторите попытку.') });
  }
}