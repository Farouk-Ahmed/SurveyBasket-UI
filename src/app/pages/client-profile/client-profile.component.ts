import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ClientService } from '../../core/services/client.service';
import { AdminService } from '../../core/services/admin.service';
import { ClientProfileResponse, UpdateClientProfileRequest } from '../../core/models/client.model';
import { AdminProfileResponse, UpdateAdminProfileRequest } from '../../core/models/admin.model';
import { AuthService } from '../../core/services/auth.service';
import { API_BASE_URL } from '../../core/config/api.config';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-profile.component.html',
  styleUrls: ['./client-profile.component.css']
})
export class ClientProfileComponent implements OnInit {
  private clientService = inject(ClientService);
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  profile: ClientProfileResponse | AdminProfileResponse | null = null;
  loading = true;
  readonly apiBaseUrl = API_BASE_URL;
  saving = false;
  uploadingAvatar = false;

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  // Form Model (shared shape; nationalId optional for admin; email/nationalId for display)
  form: UpdateClientProfileRequest & { nationalId?: string | null; email?: string } = {
    firstName: '',
    lastName: '',
    mainMobile: '',
    alternateMobile: '',
    mainAddress: '',
    alternateAddress: '',
    gender: '',
    dateOfBirth: '',
    email: '',
    nationalId: undefined
  };

  showAlternateMobile = false;
  showAlternateAddress = false;

  selectedFile: File | null = null;
  imagePreview: string | null = null;

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    const req = this.isAdmin
      ? this.adminService.getMyProfile()
      : this.clientService.getMyProfile();
    req.subscribe({
      next: (res) => {
        this.profile = res;
        const r = res as ClientProfileResponse & { nationalId?: string | null };
        this.form = {
          firstName: r.firstName ?? '',
          lastName: r.lastName ?? '',
          mainAddress: r.mainAddress ?? '',
          alternateAddress: r.alternateAddress ?? '',
          mainMobile: r.mainMobile ?? '',
          alternateMobile: r.alternateMobile ?? '',
          gender: r.gender ?? '',
          dateOfBirth: r.dateOfBirth ? r.dateOfBirth.split('T')[0] : '',
          email: r.email ?? '',
          nationalId: 'nationalId' in r ? (r.nationalId ?? '') : ''
        };
        if (this.isAdmin && 'nationalId' in r) {
          this.form.nationalId = r.nationalId ?? '';
        }

        this.showAlternateMobile = !!this.form.alternateMobile;
        this.showAlternateAddress = !!this.form.alternateAddress;

        if (res.profilePicturePath) {
          let pPath = encodeURI(res.profilePicturePath);
          if (!pPath.startsWith('/') && !pPath.startsWith('http')) {
             pPath = '/' + pPath;
          }
          this.imagePreview = pPath.startsWith('http') ? pPath : `${this.apiBaseUrl}${pPath}`;
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load profile details.');
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => this.imagePreview = e.target?.result as string;
      reader.readAsDataURL(file);

      // Instantly upload avatar
      this.uploadAvatar(file);
    }
  }

  uploadAvatar(file: File): void {
    this.uploadingAvatar = true;
    const req = this.isAdmin
      ? this.adminService.updateMyAvatar(file)
      : this.clientService.updateMyAvatar(file);
    req.subscribe({
      next: (res: { url?: string }) => {
        this.toastr.success('Avatar updated successfully!');
        if (res?.url) {
          const u = res.url.startsWith('http') ? res.url : `${this.apiBaseUrl}/${res.url.replace(/^\//, '')}`;
          this.imagePreview = u;
          this.authService.updateProfilePicturePath(res.url);
        }
        this.uploadingAvatar = false;
        this.selectedFile = null;
      },
      error: (err) => {
        this.toastr.error(err.error?.title || 'Unknown error occurred while uploading.');
        this.uploadingAvatar = false;
      }
    });
  }

  onSaveProfile(): void {
    if (!this.form.firstName || !this.form.lastName || !this.form.mainMobile) {
      this.toastr.warning('Please fill all required fields.');
      return;
    }

    this.saving = true;
    
    // Ensure DateOfBirth is correctly formatted for backend
    const submissionForm = { ...this.form };
    if (submissionForm.dateOfBirth && !submissionForm.dateOfBirth.includes('T')) {
         submissionForm.dateOfBirth = `${submissionForm.dateOfBirth}T00:00:00`;
    }

    const payload = this.isAdmin
      ? { ...submissionForm, nationalId: (this.form as UpdateAdminProfileRequest).nationalId ?? undefined } as UpdateAdminProfileRequest
      : submissionForm;
    const req = this.isAdmin
      ? this.adminService.updateMyProfile(payload)
      : this.clientService.updateMyProfile(submissionForm);
    req.subscribe({
      next: () => {
        this.toastr.success('Profile updated successfully!');
        this.saving = false;
        this.loadProfile();
      },
      error: (err) => {
        this.toastr.error('Failed to update profile. Check the form.');
        this.saving = false;
      }
    });
  }
}
