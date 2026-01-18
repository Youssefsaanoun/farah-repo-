import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
    user = { firstName: '', lastName: '', email: '', password: '' };
    error = '';

    constructor(private authService: AuthService, private router: Router) { }

    register() {
        // Validation Checks
        if (!this.user.firstName || !this.user.lastName || !this.user.password) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        if (!this.user.email) {
            alert('L\'email est requis.');
            return;
        }

        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!emailPattern.test(this.user.email)) {
            alert('Erreur: Format email invalide. Il doit contenir \'@\' et \'.\'');
            return;
        }

        this.authService.register(this.user).subscribe({
            next: (user) => {
                alert('Inscription réussie !');
                this.router.navigate(['/login']);
            },
            error: (err) => {
                console.error(err);
                let errorMessage = 'Une erreur est survenue lors de l\'inscription.';

                if (err.error) {
                    if (typeof err.error === 'object' && err.error.message) {
                        errorMessage = err.error.message;
                    } else if (typeof err.error === 'string') {
                        try {
                            const parsed = JSON.parse(err.error);
                            if (parsed.message) {
                                errorMessage = parsed.message;
                            } else {
                                errorMessage = err.error;
                            }
                        } catch (e) {
                            errorMessage = err.error;
                        }
                    }
                }

                // Fallback for duplicates if backend message is missing (should not happen now)
                if (err.status === 400 && errorMessage.includes('inscription')) {
                    errorMessage = 'Cet email est déjà utilisé !';
                }

                this.error = errorMessage;
                alert(this.error);
            }
        });
    }
}
