import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { switchMap, forkJoin, of } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { PollService } from '../../core/services/poll.service';
import { FileService } from '../../core/services/file.service';
import { AuthService } from '../../core/services/auth.service';
import { PollResponse, PollRequest } from '../../core/models/poll.model';

@Component({
    selector: 'app-polls',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
    templateUrl: './polls.component.html',
    styleUrls: ['./polls.component.css']
})
export class PollsComponent implements OnInit {
    polls: PollResponse[] = [];
    loading = true;
    showCreateForm = false;
    isSubmitting = false;
    createError = '';

    // today as 'YYYY-MM-DD' in LOCAL time (not UTC) — avoids timezone shift
    get todayStr(): string {
        return this.toLocalDateStr(new Date());
    }

    // Maximum allowed end date (startsAt + 3 months)
    get maxEndStr(): string {
        const start = this.newPoll.startsAt ? new Date(this.newPoll.startsAt) : new Date();
        const maxDate = new Date(start);
        maxDate.setMonth(maxDate.getMonth() + 3);
        return this.toLocalDateStr(maxDate);
    }

    // Delete modal state
    showDeleteModal = false;
    deleteReason = '';
    pollToDeleteId: number | null = null;
    isDeleting = false;

    // Lightbox State
    showLightbox = false;
    currentLightboxPoll: PollResponse | null = null;
    lightboxIndex = 0;
    isLightboxLoading = false;

    // Image upload state
    selectedFiles: File[] = [];
    imagePreviews: string[] = [];

    newPoll: PollRequest = {
        title: '',
        summray: '',
        isPublished: false,
        startsAt: '',
        endsAt: ''
    };

    constructor(
        private pollService: PollService,
        private fileService: FileService,
        public authService: AuthService,
        @Inject(DOCUMENT) private document: Document
    ) { }

    ngOnInit(): void {
        this.loadPolls();
    }

    loadPolls(): void {
        this.loading = true;
        this.pollService.getPolls().subscribe({
            next: (data) => {
                this.polls = data;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    /** Returns 'YYYY-MM-DD' in the user's LOCAL timezone */
    private toLocalDateStr(date: Date): string {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    toggleCreateForm(): void {
        this.showCreateForm = !this.showCreateForm;
        this.createError = '';
        if (this.showCreateForm) {
            // Set default dates: StartsAt = today, EndsAt = today + 1 month
            const today = new Date();
            const nextMonth = new Date(today);
            nextMonth.setMonth(nextMonth.getMonth() + 1);

            this.newPoll = {
                title: '',
                summray: '',
                isPublished: false,
                startsAt: this.toLocalDateStr(today),
                endsAt: this.toLocalDateStr(nextMonth)
            };
            this.selectedFiles = [];
            this.imagePreviews = [];
        }
    }

    onFilesSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files) return;
        const newFiles = Array.from(input.files);
        newFiles.forEach(file => {
            this.selectedFiles.push(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                this.imagePreviews.push(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        });
    }

    removeSelectedFile(index: number): void {
        this.selectedFiles.splice(index, 1);
        this.imagePreviews.splice(index, 1);
    }

    onCreatePoll(): void {
        if (!this.newPoll.title || !this.newPoll.summray) return;
        this.isSubmitting = true;

        // ASP.NET Core expects full ISO 8601 DateTime — append time if missing
        const toISO = (d: string) => d.includes('T') ? d : `${d}T00:00:00`;
        const payload = {
            ...this.newPoll,
            startsAt: toISO(this.newPoll.startsAt),
            endsAt:   toISO(this.newPoll.endsAt)
        };

        // Step 1: Create the poll, then upload images linked to its ID
        this.pollService.addPoll(payload).pipe(
            switchMap((createdPoll) => {
                if (this.selectedFiles.length === 0) {
                    return of([]);
                }
                const uploads = this.selectedFiles.map(file =>
                    this.fileService.upload(file, createdPoll.id)
                );
                return forkJoin(uploads);
            })
        ).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.showCreateForm = false;
                this.createError = '';
                this.selectedFiles = [];
                this.imagePreviews = [];
                this.loadPolls();
            },
            error: (err) => {
                this.isSubmitting = false;
                const errors = err?.error?.errors;
                if (errors) {
                    this.createError = Object.values(errors).flat().join(' ');
                } else {
                    this.createError = err?.error?.description || err?.error?.title || err?.error?.message || 'Failed to create poll. Please check your inputs.';
                }
                console.error('Poll create error:', err?.error || err);
            }
        });
    }

    togglePublish(poll: PollResponse): void {
        this.pollService.togglePublish(poll.id).subscribe({
            next: () => { poll.isPublished = !poll.isPublished; },
            error: () => { }
        });
    }

    // ── Delete Modal ─────────────────────────────────────────────────

    /** Delete button clicked — admin skips modal, user sees reason dialog */
    requestDeletePoll(id: number): void {
        this.pollToDeleteId = id;
        this.deleteReason = '';

        if (this.authService.isAdmin()) {
            this.executeDeletion(id, 'Deleted by admin');
        } else {
            this.showDeleteModal = true;
        }
    }

    /** Modal Confirm: user provided a reason */
    confirmDelete(): void {
        if (!this.pollToDeleteId || !this.deleteReason.trim()) return;
        this.executeDeletion(this.pollToDeleteId, this.deleteReason.trim());
    }

    cancelDelete(): void {
        this.showDeleteModal = false;
        this.pollToDeleteId = null;
        this.deleteReason = '';
    }

    private executeDeletion(id: number, reason: string): void {
        this.isDeleting = true;
        this.pollService.deletePoll(id, reason).subscribe({
            next: () => {
                this.polls = this.polls.filter(p => p.id !== id);
                this.isDeleting = false;
                this.showDeleteModal = false;
                this.pollToDeleteId = null;
                this.deleteReason = '';
            },
            error: () => {
                this.isDeleting = false;
            }
        });
    }

    // ── Lightbox Gallery & Dynamic Image Management ───────────────────

    openLightbox(poll: PollResponse, startIndex: number): void {
        if (!poll.images || poll.images.length === 0) return;
        this.currentLightboxPoll = poll;
        this.lightboxIndex = startIndex;
        this.showLightbox = true;
        this.document.body.style.overflow = 'hidden';
    }

    closeLightbox(): void {
        this.showLightbox = false;
        this.currentLightboxPoll = null;
        this.lightboxIndex = 0;
        this.document.body.style.overflow = '';
    }

    nextImage(event: Event): void {
        event.stopPropagation();
        if (this.currentLightboxPoll?.images && this.lightboxIndex < this.currentLightboxPoll.images.length - 1) {
            this.lightboxIndex++;
        }
    }

    prevImage(event: Event): void {
        event.stopPropagation();
        if (this.lightboxIndex > 0) {
            this.lightboxIndex--;
        }
    }

    deleteLightboxImage(): void {
        const poll = this.currentLightboxPoll;
        if (!poll || !poll.images) return;
        
        const imageToDelete = poll.images[this.lightboxIndex];
        if (!confirm('Are you sure you want to delete this image?')) return;

        this.isLightboxLoading = true;
        this.fileService.deleteFile(imageToDelete.id).subscribe({
            next: () => {
                this.isLightboxLoading = false;
                // Remove from local array
                poll.images!.splice(this.lightboxIndex, 1);
                
                // If no images left, close lightbox
                if (poll.images!.length === 0) {
                    this.closeLightbox();
                } else if (this.lightboxIndex >= poll.images!.length) {
                    // Shift index back if we deleted the last image
                    this.lightboxIndex = poll.images!.length - 1;
                }
            },
            error: () => {
                this.isLightboxLoading = false;
                alert('Failed to delete image');
            }
        });
    }

    uploadLightboxImage(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;
        
        const poll = this.currentLightboxPoll;
        if (!poll) return;

        this.isLightboxLoading = true;
        const newFiles = Array.from(input.files);
        
        // Upload all selected files concurrently
        const uploads = newFiles.map(file => this.fileService.upload(file, poll.id));
        
        forkJoin(uploads).subscribe({
            next: (uploadedImages) => {
                this.isLightboxLoading = false;
                if (!poll.images) poll.images = [];
                poll.images.push(...uploadedImages);
                input.value = ''; // reset input
            },
            error: () => {
                this.isLightboxLoading = false;
                alert('Failed to upload image(s)');
                input.value = ''; // reset
            }
        });
    }
}
