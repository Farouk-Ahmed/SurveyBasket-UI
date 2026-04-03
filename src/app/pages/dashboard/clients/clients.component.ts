import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ClientService } from '../../../core/services/client.service';
import { ClientDashboardResponse, ClientFilterRequest, PaginatedList } from '../../../core/models/client.model';
import { API_BASE_URL } from '../../../core/config/api.config';

@Component({
  selector: 'app-dashboard-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class DashboardClientsComponent implements OnInit {
  clients: PaginatedList<ClientDashboardResponse> | null = null;
  loading = false;
  
  filter: ClientFilterRequest = {
    pageNumber: 1,
    pageSize: 10,
    searchTerm: ''
  };

  uploadingClientId: number | null = null;

  constructor(
    private clientService: ClientService,
    @Inject(ToastrService) private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    this.clientService.getClients(this.filter).subscribe({
      next: (data) => {
        // Resolve avatar paths for UI
        data.items = data.items.map(client => {
          if (client.profilePicturePath) {
             let pPath = encodeURI(client.profilePicturePath);
             if (!pPath.startsWith('/') && !pPath.startsWith('http')) {
               pPath = '/' + pPath;
             }
             client.profilePicturePath = pPath.startsWith('http') ? pPath : `${API_BASE_URL}${pPath}`;
          }
          return client;
        });

        this.clients = data;
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load clients list.');
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.filter.pageNumber = 1; // reset to first page on search
    this.loadClients();
  }

  nextPage(): void {
    if (this.clients?.hasNextPage) {
      this.filter.pageNumber++;
      this.loadClients();
    }
  }

  prevPage(): void {
    if (this.clients?.hasPreviousPage) {
      this.filter.pageNumber--;
      this.loadClients();
    }
  }

  onChangeAvatar(client: ClientDashboardResponse, event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadingClientId = client.id;
      this.clientService.updateClientAvatar(client.id, file).subscribe({
        next: (res) => {
          this.toastr.success(`Avatar updated for ${client.firstName}`);
          this.uploadingClientId = null;
          this.loadClients(); // Reload to get fresh image path
        },
        error: (err) => {
          this.toastr.error(err.error?.title || 'Failed to update avatar.');
          this.uploadingClientId = null;
        }
      });
    }
  }

  getInitial(client: ClientDashboardResponse): string {
    return (client.firstName?.[0] || client.email?.[0] || 'U').toUpperCase();
  }
}
