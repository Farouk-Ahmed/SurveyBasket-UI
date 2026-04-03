export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    nationalId?: string;
    mainMobile?: string;
    alternateMobile?: string;
    mainAddress?: string;
    alternateAddress?: string;
    gender?: string;
    dateOfBirth?: string;
}

export interface RefreshRequest {
    accessToken: string;
    refreshToken: string;
}

/** Backend auto-generates username from FirstName + LastName. */
export interface CreateUserRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    nationalId?: string;
    mainMobile: string;
    alternateMobile?: string;
    mainAddress: string;
    alternateAddress?: string;
    dateOfBirth: string;
    gender: string;
}

export interface AuthResponse {
    id: string;
    email: string | null;
    firstName: string;
    lastName: string;
    token: string;
    expireIn: number;
    refreshToken: string;
    profilePicturePath?: string | null;
}

export interface CreateUserResponse extends AuthResponse {
    userName: string;
    roles: string[];
}

export interface ApiError {
    code: string;
    description: string;
}
