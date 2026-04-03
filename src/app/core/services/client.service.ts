import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../config/api.config';
import {
    ClientProfileResponse,
    UpdateClientProfileRequest,
    ClientDashboardResponse,
    ClientFilterRequest,
    PaginatedList
} from '../models/client.model';

@Injectable({
    providedIn: 'root'
})
export class ClientService {
    private apiUrl = `${API_BASE_URL}/api/Clients`;
    private dashboardApiUrl = `${API_BASE_URL}/api/Dashboard`;

    constructor(private http: HttpClient) {}

    // --- Client (Me) Endpoints ---

    getMyProfile(): Observable<ClientProfileResponse> {
        return this.http.get<ClientProfileResponse>(`${this.apiUrl}/me`);
    }

    updateMyProfile(request: UpdateClientProfileRequest): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/me`, request);
    }

    updateMyAvatar(file: File): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('profilePicture', file);
        return this.http.put<{ url: string }>(`${this.apiUrl}/me/avatar`, formData);
    }

    // --- Admin (Dashboard) Endpoints ---

    /** Backend returns array of accounts (Role=User). Normalized to PaginatedList for UI. */
    getClients(filter: ClientFilterRequest): Observable<PaginatedList<ClientDashboardResponse>> {
        let params = new HttpParams()
            .set('pageNumber', filter.pageNumber.toString())
            .set('pageSize', filter.pageSize.toString());
        if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);
        if (filter.email) params = params.set('email', filter.email);
        if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
        if (filter.sortDirection) params = params.set('sortDirection', filter.sortDirection);

        return this.http.get<ClientDashboardResponse[] | PaginatedList<ClientDashboardResponse>>(`${this.dashboardApiUrl}/clients`, { params }).pipe(
            map((data) => {
                if (Array.isArray(data)) {
                    const items = data as ClientDashboardResponse[];
                    return {
                        items,
                        totalCount: items.length,
                        pageNumber: filter.pageNumber,
                        totalPages: items.length < filter.pageSize ? 1 : Math.ceil(items.length / filter.pageSize) || 1,
                        hasNextPage: false,
                        hasPreviousPage: filter.pageNumber > 1
                    } as PaginatedList<ClientDashboardResponse>;
                }
                return data as PaginatedList<ClientDashboardResponse>;
            })
        );
    }

    updateClientAvatar(clientId: number, file: File): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('profilePicture', file);
        return this.http.put<{ url: string }>(`${this.dashboardApiUrl}/clients/${clientId}/avatar`, formData);
    }
}
