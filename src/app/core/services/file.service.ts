import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { FileResponse } from '../models/file.model';

@Injectable({ providedIn: 'root' })
export class FileService {
    private readonly API = `${API_BASE_URL}/api/Files`;

    constructor(private http: HttpClient) { }

    upload(file: File, pollId?: number): Observable<FileResponse> {
        const formData = new FormData();
        formData.append('file', file);
        let params = new HttpParams();
        if (pollId !== undefined) params = params.set('pollId', pollId.toString());
        return this.http.post<FileResponse>(`${this.API}/upload`, formData, { params });
    }

    getMyFiles(): Observable<FileResponse[]> {
        return this.http.get<FileResponse[]>(`${this.API}/my-files`);
    }

    getUserFiles(userId: string): Observable<FileResponse[]> {
        return this.http.get<FileResponse[]>(`${this.API}/user/${userId}`);
    }

    getAllFiles(): Observable<FileResponse[]> {
        return this.http.get<FileResponse[]>(`${this.API}/all`);
    }

    deleteFile(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API}/${id}`);
    }
}
