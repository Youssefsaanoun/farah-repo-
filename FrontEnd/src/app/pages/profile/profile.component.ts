import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/models';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    profileForm: FormGroup;
    user: User | null = null;
    message: string = '';
    messageType: 'success' | 'error' = 'success';
    showPassword = false;
    showOldPassword = false;

    togglePassword(): void {
        this.showPassword = !this.showPassword;
    }

    toggleOldPassword(): void {
        this.showOldPassword = !this.showOldPassword;
    }

    constructor(
        private fb: FormBuilder,
        private authService: AuthService
    ) {
        this.profileForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: [''], // New password
            oldPassword: [''] // Old password required for change
        });
    }

    ngOnInit(): void {
        this.user = this.authService.getCurrentUser();
        if (this.user) {
            this.profileForm.patchValue({
                firstName: this.user.firstName,
                lastName: this.user.lastName,
                email: this.user.email
            });
        }
    }

    onSubmit(): void {
        if (this.profileForm.invalid || !this.user?.id) return;

        const formValue = this.profileForm.value;
        if (formValue.password && !formValue.oldPassword) {
            this.message = 'Veuillez entrer votre ancien mot de passe pour modifier le mot de passe.';
            this.messageType = 'error';
            return;
        }

        this.authService.updateProfile(this.user.id, formValue).subscribe({
            next: (updatedUser) => {
                this.message = 'Profil mis à jour avec succès !';
                this.messageType = 'success';
                this.authService.setCurrentUser(updatedUser);
                this.profileForm.patchValue({
                    password: '',
                    oldPassword: ''
                });
            },
            error: (err) => {
                console.error(err);
                if (err.error && err.error.message) {
                    this.message = err.error.message;
                } else if (err.error && typeof err.error === 'string') {
                    try {
                        const parsed = JSON.parse(err.error);
                        this.message = parsed.message || err.error;
                    } catch (e) {
                        this.message = err.error || 'Erreur inconnue';
                    }
                } else {
                    this.message = 'Échec de la mise à jour du profil. Veuillez vérifier vos informations.';
                }
                this.messageType = 'error';
            }
        });
    }
}
