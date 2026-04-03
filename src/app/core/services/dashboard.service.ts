import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { DashboardFilterRequest, DashboardSummaryResponse, DashboardPollResponse, AuditLogResponse } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private readonly API = `${API_BASE_URL}/api/Dashboard`;

    constructor(private http: HttpClient) { }

    getSummary(filter?: DashboardFilterRequest): Observable<DashboardSummaryResponse> {
        let params = new HttpParams();
        if (filter) {
            params = params.set('includeDeleted', String(!!filter.includeDeleted));
            params = params.set('onlyDeleted', String(!!filter.onlyDeleted));
            if (filter.isPublished !== undefined) params = params.set('isPublished', String(filter.isPublished));
            if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
            if (filter.sortDirection) params = params.set('sortDirection', filter.sortDirection);
            if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);
        }
        return this.http.get<DashboardSummaryResponse>(`${this.API}/summary`, { params });
    }

    getPollDetails(id: number): Observable<DashboardPollResponse> {
        return this.http.get<DashboardPollResponse>(`${this.API}/polls/${id}`);
    }

    getPollAuditLog(id: number): Observable<AuditLogResponse[]> {
        return this.http.get<AuditLogResponse[]>(`${this.API}/polls/${id}/audit`);
    }

    getAllAuditLogs(filter?: DashboardFilterRequest): Observable<AuditLogResponse[]> {
        let params = new HttpParams();
        if (filter) {
            params = params.set('includeDeleted', String(!!filter.includeDeleted));
            params = params.set('onlyDeleted', String(!!filter.onlyDeleted));
            if (filter.isPublished !== undefined) params = params.set('isPublished', String(filter.isPublished));
            if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
            if (filter.sortDirection) params = params.set('sortDirection', filter.sortDirection);
            if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);
        }
        return this.http.get<AuditLogResponse[]>(`${this.API}/audit-logs`, { params });
    }
}
