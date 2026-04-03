import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, RefreshRequest, CreateUserRequest, CreateUserResponse } from '../models/auth.model';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from '../config/api.config';

interface JwtPayload {
    sub: string;
    email: string;
    given_name: string;
    family_name: string;
    role: string | string[];
    exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly API = API_BASE_URL;
    private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.getStoredUser());
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) { }

    login(request: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API}/api/Auth/login`, request).pipe(
            tap(res => this.storeAuth(res))
        );
    }

    register(request: FormData): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API}/api/Auth/register`, request).pipe(
            tap(res => this.storeAuth(res))
        );
    }

    refresh(): Observable<AuthResponse> {
        const user = this.getStoredUser();
        const request: RefreshRequest = {
            accessToken: user?.token || '',
            refreshToken: user?.refreshToken || ''
        };
        return this.http.post<AuthResponse>(`${this.API}/Auth/refresh`, request).pipe(
            tap(res => this.storeAuth(res))
        );
    }

    createUser(request: CreateUserRequest): Observable<CreateUserResponse> {
        return this.http.post<CreateUserResponse>(`${this.API}/api/Dashboard/create-user`, request);
    }

    logout(): void {
        localStorage.removeItem('sb_user');
        this.currentUserSubject.next(null);
    }

    getToken(): string | null {
        return this.getStoredUser()?.token || null;
    }

    isLoggedIn(): boolean {
        const token = this.getToken();
        if (!token) return false;
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            return decoded.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }

    isAdmin(): boolean {
        const token = this.getToken();
        if (!token) return false;
        try {
            const decoded = jwtDecode<any>(token);
            // ASP.NET Core Identity uses this specific URL for the Role claim by default
            const roleClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            if (!roleClaim) return false;

            const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
            return roles.includes('Admin');
        } catch {
            return false;
        }
    }

    getCurrentUser(): AuthResponse | null {
        return this.currentUserSubject.value;
    }

    /** Updates the stored user's profile picture path (e.g. after avatar upload). Header/UI will reflect the new picture. */
    updateProfilePicturePath(path: string | null): void {
        const user = this.getStoredUser();
        if (!user) return;
        const updated: AuthResponse = { ...user, profilePicturePath: path ?? undefined };
        this.storeAuth(updated);
    }

    private storeAuth(res: AuthResponse): void {
        localStorage.setItem('sb_user', JSON.stringify(res));
        this.currentUserSubject.next(res);
    }

    private getStoredUser(): AuthResponse | null {
        try {
            const data = localStorage.getItem('sb_user');
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }
}
