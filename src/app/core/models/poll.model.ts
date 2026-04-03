import { FileResponse } from './file.model';

export interface PollRequest {
    title: string;
    summray: string;
    isPublished: boolean;
    startsAt: string;
    endsAt: string;
}

export interface PollResponse {
    id: number;
    title: string;
    note: string;
    isPublished: boolean;
    startsAt: string;
    endsAt: string;
    images: FileResponse[];
}
