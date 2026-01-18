import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './reset-password.component.html',
    styles: [`
    .auth-container {
      max-width: 400px;
      margin: 4rem auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .form-group { margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    input { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; }
    .btn-primary { width: 100%; padding: 0.75rem; background: #000; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .error { color: #dc3545; margin-bottom: 1rem; font-size: 0.875rem; }
    .success { color: #28a745; margin-bottom: 1rem; text-align: center; }
    .password-wrapper { position: relative; }
    .password-wrapper input { padding-right: 40px; }
    .btn-toggle-password {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: #666;
      padding: 0;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
    password = '';
    confirmPassword = '';
    email = '';
    error = '';
    message = '';
    isLoading = false;
    showPassword = false;
    showConfirmPassword = false;

    constructor(
        private route: ActivatedRoute,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.email = params['email'];
            if (!this.email) {
                this.error = 'Invalid password reset link.';
            }
        });
    }

    togglePassword() {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPassword() {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    onSubmit() {
        if (this.password !== this.confirmPassword) {
            this.error = 'Les mots de passe ne correspondent pas.';
            return;
        }

        this.isLoading = true;
        this.error = '';

        this.authService.resetPassword(this.email, this.password).subscribe({
            next: () => {
                this.message = 'Mot de passe réinitialisé avec succès ! Redirection vers la connexion...';
                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 3000);
            },
            error: (err) => {
                this.error = 'Échec de la réinitialisation du mot de passe. Veuillez réessayer.';
                this.isLoading = false;
            }
        });
    }
}
