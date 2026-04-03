import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-floating-nav',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './floating-nav.component.html',
    styleUrls: ['./floating-nav.component.css']
})
export class FloatingNavComponent {
    @Input() sectionIds: string[] = [];
    currentIndex = 0;
    isAtEnd = false;

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', () => this.updateCurrentIndex());
        }
    }

    scrollNext(): void {
        if (this.isAtEnd) {
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.currentIndex = 0;
            this.isAtEnd = false;
            return;
        }

        this.currentIndex++;
        if (this.currentIndex >= this.sectionIds.length) {
            this.currentIndex = this.sectionIds.length - 1;
            this.isAtEnd = true;
        }

        const el = document.getElementById(this.sectionIds[this.currentIndex]);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    }

    private updateCurrentIndex(): void {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        for (let i = this.sectionIds.length - 1; i >= 0; i--) {
            const el = document.getElementById(this.sectionIds[i]);
            if (el && el.offsetTop <= scrollY + windowHeight / 2) {
                this.currentIndex = i;
                break;
            }
        }

        this.isAtEnd = this.currentIndex >= this.sectionIds.length - 1 &&
            (scrollY + windowHeight) >= document.documentElement.scrollHeight - 100;
    }
}
