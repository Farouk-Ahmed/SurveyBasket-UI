import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { PollRequest, PollResponse } from '../models/poll.model';

@Injectable({ providedIn: 'root' })
export class PollService {
    private readonly API = `${API_BASE_URL}/api/Polls`;

    constructor(private http: HttpClient) { }

    getPolls(): Observable<PollResponse[]> {
        return this.http.get<PollResponse[]>(`${this.API}/GetPolls`);
    }

    getPollById(id: number): Observable<PollResponse> {
        return this.http.get<PollResponse>(`${this.API}/${id}`);
    }

    addPoll(request: PollRequest): Observable<PollResponse> {
        return this.http.post<PollResponse>(`${this.API}/Addpool`, request);
    }

    updatePoll(request: PollRequest, id: number): Observable<void> {
        return this.http.put<void>(`${this.API}/${id}`, request);
    }

    deletePoll(id: number, reason?: string): Observable<void> {
        let params = new HttpParams();
        if (reason) params = params.set('reason', reason);
        return this.http.delete<void>(`${this.API}/${id}`, { params });
    }

    togglePublish(id: number): Observable<void> {
        return this.http.put<void>(`${this.API}/${id}/toggle-publish`, {});
    }
}
