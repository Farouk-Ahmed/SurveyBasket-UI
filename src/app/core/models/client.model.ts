export interface ClientProfileResponse {
    id: number;
    userName?: string;
    firstName: string;
    lastName: string;
    nationalId: string;
    email: string;
    mainMobile: string;
    alternateMobile: string | null;
    mainAddress: string;
    alternateAddress: string | null;
    gender: string;
    dateOfBirth: string;
    profilePicturePath: string | null;
}

export interface UpdateClientProfileRequest {
    firstName: string;
    lastName: string;
    mainAddress: string;
    alternateAddress?: string;
    mainMobile: string;
    alternateMobile?: string;
    dateOfBirth: string;
    gender: string;
}

/** Single account (Role=User) from dashboard. Id is Account.Id. */
export interface ClientDashboardResponse {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    nationalId: string;
    profilePicturePath: string | null;
    appUserId?: string;
    registeredOn?: string;
}

export interface ClientFilterRequest {
    searchTerm?: string;
    email?: string;
    sortBy?: string;
    sortDirection?: string;
    pageNumber: number;
    pageSize: number;
}

export interface PaginatedList<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
