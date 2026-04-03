import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { API_BASE_URL } from '../../../core/config/api.config';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent {
    isScrolled = false;
    mobileOpen = false;

    constructor(public authService: AuthService) {
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', () => {
                this.isScrolled = window.scrollY > 50;
            });
        }
    }

    getUserFullName(): string {
        const user = this.authService.getCurrentUser();
        if (!user) return 'User';
        return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User';
    }

    getUserProfilePicture(): string | null {
        const user = this.authService.getCurrentUser();
        if (!user?.profilePicturePath) return null;
        let path = user.profilePicturePath.trim().replace(/\\/g, '/');
        if (path.startsWith('http')) return path;
        const encodedPath = path.startsWith('/') ? encodeURI(path) : '/' + encodeURI(path);
        const base = API_BASE_URL.replace(/\/$/, '');
        return `${base}${encodedPath}`;
    }

    getUserInitial(): string {
        const user = this.authService.getCurrentUser();
        return (user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase();
    }

    toggleMobile(): void {
        this.mobileOpen = !this.mobileOpen;
    }
}
