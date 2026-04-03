import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { AdminProfileResponse, UpdateAdminProfileRequest } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
    private apiUrl = `${API_BASE_URL}/api/Admins`;

    constructor(private http: HttpClient) {}

    getMyProfile(): Observable<AdminProfileResponse> {
        return this.http.get<AdminProfileResponse>(`${this.apiUrl}/me`);
    }

    updateMyProfile(request: UpdateAdminProfileRequest): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/me`, request);
    }

    updateMyAvatar(file: File): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('profilePicture', file);
        return this.http.put<{ url: string }>(`${this.apiUrl}/me/avatar`, formData);
    }
}
