import { FileResponse } from './file.model';

export interface DashboardFilterRequest {
    isPublished?: boolean;
    includeDeleted?: boolean;
    onlyDeleted?: boolean;
    sortBy?: string;
    sortDirection?: string;
    searchTerm?: string;
}

export interface DashboardSummaryResponse {
    totalPolls: number;
    publishedPolls: number;
    unpublishedPolls: number;
    deletedPolls: number;
    polls: DashboardPollResponse[];
}

export interface DashboardPollResponse {
    id: number;
    title: string;
    summary: string;
    isPublished: boolean;
    startsAt: string;
    endsAt: string;
    createdByName: string;
    updatedByName: string | null;
    createdOn: string;
    updatedOn: string | null;
    isDeleted: boolean;
    deletedByName: string | null;
    deletedOn: string | null;
    deletionReason: string | null;
    images?: FileResponse[];
}

export interface AuditLogResponse {
    id: number;
    pollId: number;
    pollTitle: string;
    action: string;
    performedByName: string;
    performedOn: string;
    details?: string;
    deletionReason?: string | null;
}
