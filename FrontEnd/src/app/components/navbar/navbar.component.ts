import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { FavoriteService } from '../../services/favorite.service';
import { OrderService } from '../../services/order.service';
import { User } from '../../models/models';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
    cartItemCount = 0;
    favoriteItemCount = 0;
    pendingOrdersCount = 0;
    currentUser: User | null = null;
    isMenuOpen = false;
    isUserMenuOpen = false;
    private pollingInterval: any;

    constructor(
        private cartService: CartService,
        public authService: AuthService,
        private favoriteService: FavoriteService,
        private orderService: OrderService
    ) { }

    ngOnInit() {
        this.cartService.cartItems$.subscribe(items => {
            this.cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);
        });

        this.favoriteService.favoriteItems$.subscribe(items => {
            this.favoriteItemCount = items.length;
        });

        // Subscribe to live pending orders count
        this.orderService.pendingOrdersCount$.subscribe(count => {
            this.pendingOrdersCount = count;
        });

        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
            if (user && user.role === 'ADMIN') {
                this.startOrderPolling();
            } else {
                this.stopOrderPolling();
            }
        });
    }

    ngOnDestroy() {
        this.stopOrderPolling();
    }

    startOrderPolling() {
        // Initial load
        this.orderService.refreshPendingOrders();

        // Poll every 15 seconds
        this.stopOrderPolling();
        this.pollingInterval = setInterval(() => {
            this.orderService.refreshPendingOrders();
        }, 15000);
    }

    stopOrderPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }

    toggleUserMenu() {
        this.isUserMenuOpen = !this.isUserMenuOpen;
    }

    closeUserMenu() {
        this.isUserMenuOpen = false;
    }

    logout() {
        this.stopOrderPolling();
        this.authService.logout();
        this.currentUser = null;
        window.location.href = '/';
    }
}
