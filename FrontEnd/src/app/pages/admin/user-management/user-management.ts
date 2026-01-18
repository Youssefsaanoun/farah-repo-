import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/models';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.scss']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';

  // Stats
  totalUsers: number = 0;
  activeUsers: number = 0;
  blockedUsers: number = 0;

  // Modal
  showModal: boolean = false;
  modalMode: 'add' | 'edit' = 'add';
  selectedUser: any = { firstName: '', lastName: '', email: '', password: '', role: 'CLIENT' };

  // Current Admin
  currentUser: any = null;

  constructor(private userService: UserService, private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.updateStats();
        this.filterUsers();
      },
      error: (err) => console.error('Error fetching users:', err)
    });
  }

  updateStats(): void {
    this.totalUsers = this.users.length;
    this.activeUsers = this.users.filter(u => !u.isBlocked).length;
    this.blockedUsers = this.users.filter(u => u.isBlocked).length;
  }

  sortOption: string = 'Date d\'inscription';

  filterUsers(): void {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(user =>
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }
    this.sortUsers();
  }

  sortUsers(): void {
    if (this.sortOption === 'Nom (A-Z)') {
      this.filteredUsers.sort((a, b) => a.lastName.localeCompare(b.lastName));
    } else if (this.sortOption === 'Role') {
      this.filteredUsers.sort((a, b) => a.role.localeCompare(b.role));
    } else if (this.sortOption === 'Date d\'inscription') {
      // Assuming ID is a proxy for date since we don't have a date field, 
      // or we can sort by ID descending (newest first)
      this.filteredUsers.sort((a, b) => b.id - a.id);
    }
  }

  // --- Actions ---

  deleteUser(id: number): void {
    if (id === this.currentUser?.id) return; // Prevent self-delete

    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
          alert('Utilisateur supprimé');
        },
        error: (err) => console.error('Error deleting user:', err)
      });
    }
  }

  blockUser(id: number): void {
    if (id === this.currentUser?.id) return;

    if (confirm('Voulez-vous bloquer cet utilisateur ?')) {
      this.userService.blockUser(id).subscribe({
        next: () => {
          this.loadUsers();
          alert('Utilisateur bloqué avec succès');
        },
        error: (err) => {
          console.error('Error blocking user:', err);
          alert('Erreur lors du blocage: ' + (err.error?.message || 'Erreur inconnue'));
        }
      });
    }
  }

  unblockUser(id: number): void {
    if (confirm('Voulez-vous débloquer cet utilisateur ?')) {
      this.userService.unblockUser(id).subscribe({
        next: () => {
          this.loadUsers();
          alert('Utilisateur débloqué avec succès');
        },
        error: (err) => {
          console.error('Error unblocking user:', err);
          alert('Erreur lors du déblocage: ' + (err.error?.message || 'Erreur inconnue'));
        }
      });
    }
  }

  // --- Export Excel (XLSX) ---
  exportToExcel(): void {
    const data = this.users.map(u => ({
      'ID': u.id,
      'Nom': u.lastName,
      'Prénom': u.firstName,
      'Email': u.email,
      'Rôle': u.role,
      'Statut': u.isBlocked ? 'Bloqué' : 'Actif'
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Utilisateurs');

    XLSX.writeFile(wb, 'Utilisateurs_Farah_Couture.xlsx');
  }

  // --- Modals (Add/Edit) ---
  openAddModal(): void {
    this.modalMode = 'add';
    this.selectedUser = { firstName: '', lastName: '', email: '', password: '', role: 'CLIENT' };
    this.showModal = true;
  }

  openEditModal(user: User): void {
    this.modalMode = 'edit';
    this.selectedUser = { ...user, password: '' }; // Don't show password, allow reset
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  submitUser(): void {
    // 1. Validation de saisie (Manual Validation)
    if (!this.selectedUser.firstName || !this.selectedUser.lastName || !this.selectedUser.email) {
      alert('Veuillez remplir tous les champs obligatoires (Nom, Prénom, Email).');
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(this.selectedUser.email)) {
      alert('Erreur: Format email invalide. Il doit contenir \'@\' et \'.\'');
      return;
    }

    // Password validation for ADD mode
    if (this.modalMode === 'add' && !this.selectedUser.password) {
      alert('Le mot de passe est requis pour la création d\'un utilisateur.');
      return;
    }

    if (this.modalMode === 'add') {
      this.userService.createUser(this.selectedUser).subscribe({
        next: () => {
          this.showModal = false;
          this.loadUsers();
          alert('Utilisateur créé avec succès');
        },
        error: (err) => {
          console.error(err);
          let msg = 'Erreur lors de la création';
          if (err.error) {
            if (typeof err.error === 'object' && err.error.message) {
              msg = err.error.message;
            } else if (typeof err.error === 'string') {
              try {
                const parsed = JSON.parse(err.error);
                msg = parsed.message || err.error;
              } catch (e) {
                msg = err.error;
              }
            }
          }
          alert(msg);
        }
      });
    } else {
      this.userService.updateUserByAdmin(this.selectedUser.id, this.selectedUser).subscribe({
        next: () => {
          this.showModal = false;
          this.loadUsers();
          alert('Utilisateur mis à jour');
        },
        error: (err) => {
          console.error(err);
          let msg = 'Erreur lors de la mise à jour';
          if (err.error) {
            if (typeof err.error === 'object' && err.error.message) {
              msg = err.error.message;
            } else if (typeof err.error === 'string') {
              try {
                const parsed = JSON.parse(err.error);
                msg = parsed.message || err.error;
              } catch (e) {
                msg = err.error;
              }
            }
          }
          alert(msg);
        }
      });
    }
  }

}
