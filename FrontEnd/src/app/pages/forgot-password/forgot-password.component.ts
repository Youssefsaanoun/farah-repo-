import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
    email: string = '';
    message: string = '';
    error: string = '';
    isLoading = false;

    constructor(private authService: AuthService) { }

    onSubmit() {
        if (!this.email) {
            this.error = 'Please enter your email address.';
            return;
        }

        this.isLoading = true;
        this.error = '';
        this.message = '';

        this.authService.requestPasswordReset(this.email).subscribe({
            next: () => {
                this.isLoading = false;
                this.message = 'If an account exists with this email, you will receive password reset instructions.';
                this.email = '';
            },
            error: (err) => {
                this.isLoading = false;
                // Even on error, we might want to show success to prevent email enumeration,
                // but for this MVP/debug we can be honest or generic.
                this.message = 'If an account exists with this email, you will receive password reset instructions.';
                console.error(err);
            }
        });
    }
}
