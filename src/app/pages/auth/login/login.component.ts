import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.model';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    form: LoginRequest = { email: '', password: '' };
    loading = false;
    errorMessage = '';

    constructor(private authService: AuthService, private router: Router) { }

    onLogin(): void {
        this.loading = true;
        this.errorMessage = '';
        this.authService.login(this.form).subscribe({
            next: () => {
                this.loading = false;
                this.router.navigate(['/']);
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = err.error?.description || err.error?.message || 'Invalid email or password.';
            }
        });
    }
}
