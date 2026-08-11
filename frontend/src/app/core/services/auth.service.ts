import { computed, inject, Injectable, signal } from "@angular/core";
import { User } from "../models/user.model";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, pairwise, tap } from "rxjs";
import { environment } from "../../../environments/environment";

interface LoginResponse {
    accessToken: string;
    user: User;
}

interface LoginPayload {
    email: string;
    password: string;
}

interface RegisterPayload {
    email: string;
    password: string;
    name: string;
    phone?: string;
}

const TOKEN_KEY = 'psico_app_token';
const USER_KEY = 'psico_app_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly currentUserSignal = signal<User | null>(this.loadStoredUser());

    readonly currentUser = this.currentUserSignal.asReadonly();
    readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
    readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');

    login(payload: LoginPayload): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
            tap((response) => {
                this.storeSession(response.accessToken, response.user);
            }),
        );
    }

    register(payload: RegisterPayload): Observable<User> {
        return this.http.post<User>(`${environment.apiUrl}/users`, payload);
    }

    logout(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        this.currentUserSignal.set(null);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    private storeSession(token: string, user: User): void {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.currentUserSignal.set(user);
    }

    private loadStoredUser(): User | null {
        const stored = localStorage.getItem(USER_KEY);
        return stored ? JSON.parse(stored) : null;
    }
}