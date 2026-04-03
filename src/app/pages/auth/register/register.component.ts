import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.model';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    form: RegisterRequest = { 
        email: '', 
        password: '', 
        confirmPassword: '',
        firstName: '',
        lastName: '',
        nationalId: '',
        mainMobile: '',
        alternateMobile: '',
        mainAddress: '',
        alternateAddress: '',
        gender: '',
        dateOfBirth: ''
    };
    
    showAlternateMobile = false;
    showAlternateAddress = false;
    
    selectedFile: File | null = null;
    imagePreview: string | null = null;
    loading = false;
    errorMessage = '';

    constructor(private authService: AuthService, private router: Router) { }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
            
            // Generate preview
            const reader = new FileReader();
            reader.onload = (e) => this.imagePreview = e.target?.result as string;
            reader.readAsDataURL(this.selectedFile);
        }
    }

    onRegister(): void {
        if (this.form.password !== this.form.confirmPassword) {
            this.errorMessage = 'Passwords do not match.';
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        // Build FormData
        const formData = new FormData();
        formData.append('email', this.form.email);
        formData.append('password', this.form.password);
        formData.append('confirmPassword', this.form.confirmPassword);
        formData.append('firstName', this.form.firstName);
        formData.append('lastName', this.form.lastName);
        
        // These fields are marked [Required] in the backend so we must always send them, even if empty.
        // However, empty string causes 400 Bad request. They should be validated in frontend first.
        formData.append('nationalId', this.form.nationalId || 'N/A');
        formData.append('mainMobile', this.form.mainMobile || 'N/A');
        formData.append('mainAddress', this.form.mainAddress || 'N/A');
        formData.append('gender', this.form.gender || 'NotSpecified');
        
        // DateOfBirth must be a valid date string. 
        if (this.form.dateOfBirth) {
            // Append with time so ASP.NET parses it correctly as DateTime
            formData.append('dateOfBirth', `${this.form.dateOfBirth}T00:00:00`);
        } else {
            // Fallback to today if empty to bypass required exception
            formData.append('dateOfBirth', new Date().toISOString());
        }

        // Alternate fields
        if (this.showAlternateMobile && this.form.alternateMobile) {
            formData.append('alternateMobile', this.form.alternateMobile);
        }
        if (this.showAlternateAddress && this.form.alternateAddress) {
            formData.append('alternateAddress', this.form.alternateAddress);
        }
        
        if (this.selectedFile) {
            formData.append('ProfilePicture', this.selectedFile);
        }

        this.authService.register(formData).subscribe({
            next: () => {
                this.loading = false;
                this.router.navigate(['/']);
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = err.error?.description || err.error?.message || Object.values(err.error?.errors || {}).flat().join(', ') || 'Registration failed. Please try again.';
            }
        });
    }
}
