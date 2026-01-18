import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    credentials = { email: '', password: '' };
    error = '';
    showPassword = false;

    togglePassword() {
        this.showPassword = !this.showPassword;
    }

    constructor(private authService: AuthService, private router: Router) { }

    login() {
        this.authService.login(this.credentials).subscribe({
            next: (user) => {
                if (user) {
                    this.authService.setCurrentUser(user);
                    this.router.navigate(['/']);
                } else {
                    this.error = 'Email ou mot de passe incorrect';
                }
            },
            error: (err) => {
                this.error = 'Email ou mot de passe incorrect';
            }
        });
    }
}
