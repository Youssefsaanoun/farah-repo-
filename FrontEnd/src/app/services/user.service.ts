import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient) { }

    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/all`);
    }

    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    blockUser(id: number): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${id}/block`, {});
    }

    unblockUser(id: number): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${id}/unblock`, {});
    }

    createUser(user: User): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/register`, user);
    }

    updateUser(id: number, user: User): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${id}`, user);
    }

    updateUserByAdmin(id: number, user: User): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/admin/${id}`, user);
    }
}
