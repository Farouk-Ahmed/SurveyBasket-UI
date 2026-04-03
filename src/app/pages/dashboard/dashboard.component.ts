import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardSummaryResponse, AuditLogResponse, DashboardFilterRequest } from '../../core/models/dashboard.model';
import { FileResponse } from '../../core/models/file.model';
import { CreateUserRequest } from '../../core/models/auth.model';
import { DashboardClientsComponent } from './clients/clients.component';

export type PollStatusFilter = 'total' | 'published' | 'unpublished' | 'deleted';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, DashboardClientsComponent],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    summary: DashboardSummaryResponse | null = null;
    auditLogs: AuditLogResponse[] = [];
    showCreateUser = false;
    pollStatusFilter: PollStatusFilter = 'total';
    filter: DashboardFilterRequest = {};
    loadingPolls = false;
    loadingAuditLogs = false;
    errorPolls: string | null = null;
    errorAuditLogs: string | null = null;
    newUser: CreateUserRequest & { nationalId?: string } = {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'User',
        nationalId: '',
        mainMobile: '',
        alternateMobile: '',
        mainAddress: '',
        alternateAddress: '',
        dateOfBirth: '',
        gender: ''
    };
    createUserError = '';

    /** Lightbox for poll images */
    showImageLightbox = false;
    lightboxImages: FileResponse[] = [];
    lightboxIndex = 0;

    constructor(
        public authService: AuthService,
        private dashboardService: DashboardService,
        @Inject(ToastrService) private toastr: ToastrService
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        const req = this.buildFilterRequest();
        this.errorPolls = null;
        this.errorAuditLogs = null;
        this.loadingPolls = true;
        this.loadingAuditLogs = true;

        this.dashboardService.getSummary(req).subscribe({
            next: (data) => {
                this.summary = data;
                this.loadingPolls = false;
            },
            error: (err) => {
                this.errorPolls = err?.error?.message || err?.message || 'Failed to load polls.';
                this.loadingPolls = false;
            }
        });
        this.dashboardService.getAllAuditLogs(req).subscribe({
            next: (data) => {
                this.auditLogs = this.sortAuditLogsByDateDesc(data);
                this.loadingAuditLogs = false;
            },
            error: (err) => {
                this.errorAuditLogs = err?.error?.message || err?.message || 'Failed to load audit logs.';
                this.loadingAuditLogs = false;
            }
        });
    }

    /** Ensure most recent first (backend already sorts; this guards consistency). */
    private sortAuditLogsByDateDesc(logs: AuditLogResponse[]): AuditLogResponse[] {
        return [...logs].sort((a, b) => new Date(b.performedOn).getTime() - new Date(a.performedOn).getTime());
    }

    loadSummary(): void {
        this.loadData();
    }

    private buildFilterRequest(): DashboardFilterRequest {
        const base = { ...this.filter };
        switch (this.pollStatusFilter) {
            case 'published':
                return { ...base, isPublished: true, includeDeleted: false, onlyDeleted: false };
            case 'unpublished':
                return { ...base, isPublished: false, includeDeleted: false, onlyDeleted: false };
            case 'deleted':
                return { ...base, includeDeleted: false, onlyDeleted: true };
            default:
                return { ...base, includeDeleted: true, onlyDeleted: false };
        }
    }

    setPollStatusFilter(status: PollStatusFilter): void {
        this.pollStatusFilter = status;
        this.loadData();
    }

    onSearchChange(): void {
        this.loadData();
    }

    openImageLightbox(images: FileResponse[], index = 0): void {
        if (!images?.length) return;
        this.lightboxImages = images;
        this.lightboxIndex = Math.max(0, Math.min(index, images.length - 1));
        this.showImageLightbox = true;
    }

    closeImageLightbox(): void {
        this.showImageLightbox = false;
    }

    lightboxPrev(): void {
        this.lightboxIndex = this.lightboxIndex <= 0 ? this.lightboxImages.length - 1 : this.lightboxIndex - 1;
    }

    lightboxNext(): void {
        this.lightboxIndex = this.lightboxIndex >= this.lightboxImages.length - 1 ? 0 : this.lightboxIndex + 1;
    }

    private getEmptyNewUser(): CreateUserRequest & { nationalId?: string } {
        return {
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            role: 'User',
            nationalId: '',
            mainMobile: '',
            alternateMobile: '',
            mainAddress: '',
            alternateAddress: '',
            dateOfBirth: '',
            gender: ''
        };
    }

    resetNewUser(): void {
        this.newUser = this.getEmptyNewUser();
        this.createUserError = '';
    }

    openCreateUserForm(): void {
        this.resetNewUser();
        this.showCreateUser = true;
    }

    onCreateUser(): void {
        this.createUserError = '';
        if (!this.newUser.email?.trim() || !this.newUser.password || !this.newUser.firstName?.trim() || !this.newUser.lastName?.trim()) {
            this.createUserError = 'Please fill Email, Password, First Name and Last Name.';
            return;
        }
        if (this.newUser.password.length < 6) {
            this.createUserError = 'Password must be at least 6 characters.';
            return;
        }
        if (!this.newUser.mainMobile?.trim() || !this.newUser.mainAddress?.trim() || !this.newUser.dateOfBirth || !this.newUser.gender?.trim()) {
            this.createUserError = 'Please fill Main Mobile, Main Address, Date of Birth and Gender.';
            return;
        }
        if (this.newUser.role === 'User' && !(this.newUser.nationalId ?? '').trim()) {
            this.createUserError = 'National ID is required when creating a User (Client).';
            return;
        }
        const payload: CreateUserRequest = {
            email: this.newUser.email.trim(),
            password: this.newUser.password,
            firstName: this.newUser.firstName.trim(),
            lastName: this.newUser.lastName.trim(),
            role: this.newUser.role,
            nationalId: (this.newUser.nationalId ?? '').trim() || undefined,
            mainMobile: (this.newUser.mainMobile ?? '').trim(),
            alternateMobile: (this.newUser.alternateMobile ?? '').trim() || undefined,
            mainAddress: (this.newUser.mainAddress ?? '').trim(),
            alternateAddress: (this.newUser.alternateAddress ?? '').trim() || undefined,
            dateOfBirth: this.newUser.dateOfBirth?.includes('T') ? this.newUser.dateOfBirth : `${this.newUser.dateOfBirth}T00:00:00`,
            gender: (this.newUser.gender ?? '').trim()
        };
        this.authService.createUser(payload).subscribe({
            next: () => {
                this.toastr.success('Account created successfully.');
                this.showCreateUser = false;
                this.resetNewUser();
            },
            error: (err) => {
                this.createUserError = err.error?.description || err.error?.title || err.message || 'Failed to create user.';
            }
        });
    }
}
