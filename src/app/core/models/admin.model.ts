export interface AdminProfileResponse {
    id: number;
    userName?: string;
    firstName: string;
    lastName: string;
    nationalId: string | null;
    email: string;
    mainMobile: string;
    alternateMobile: string | null;
    mainAddress: string;
    alternateAddress: string | null;
    gender: string;
    dateOfBirth: string;
    profilePicturePath: string | null;
}

export interface UpdateAdminProfileRequest {
    firstName: string;
    lastName: string;
    nationalId?: string | null;
    mainAddress: string;
    alternateAddress?: string;
    mainMobile: string;
    alternateMobile?: string;
    dateOfBirth: string;
    gender: string;
}
