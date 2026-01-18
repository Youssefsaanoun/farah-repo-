import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/users`;
    private currentUser: User | null = null;
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
        if (isPlatformBrowser(this.platformId)) {
            const storedUser = localStorage.getItem('currentUser');
            const storedToken = localStorage.getItem('authToken');
            if (storedUser) {
                try {
                    this.currentUserSubject.next(JSON.parse(storedUser));
                    this.currentUser = JSON.parse(storedUser);
                } catch (e) {
                    console.error(e);
                    this.logout();
                }
            }
        }
    }

    register(user: any): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/register`, user);
    }

    login(credentials: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                if (response && response.token) {
                    this.setSession(response);
                }
            })
        );
    }

    private setSession(authResult: any) {
        const user: User = {
            id: authResult.id,
            email: authResult.email,
            firstName: authResult.firstName,
            lastName: authResult.lastName,
            role: authResult.role,

        };

        this.currentUser = user;
        this.currentUserSubject.next(user);

        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('authToken', authResult.token);
        }
    }

    getToken(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem('authToken');
        }
        return null;
    }

    setCurrentUser(user: User) {
        // This is mainly used for manual updates if needed, but primary flow is via login/setSession
        this.currentUser = user;
        this.currentUserSubject.next(user);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        }
    }

    getCurrentUser(): User | null {
        return this.currentUser;
    }

    updateProfile(userId: number, user: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${userId}`, user);
    }

    requestPasswordReset(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/forgot-password`, { email });
    }

    resetPassword(email: string, password: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/reset-password`, { email, newPassword: password });
    }

    isAdmin(): boolean {
        const user = this.getCurrentUser();
        return user?.role === 'ADMIN';
    }

    logout() {
        this.currentUser = null;
        this.currentUserSubject.next(null);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
        }
    }
}

