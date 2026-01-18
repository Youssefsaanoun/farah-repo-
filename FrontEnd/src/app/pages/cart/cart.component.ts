import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ImageUrlPipe } from '../../pipes/image-url-pipe';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { Observable } from 'rxjs';
import { CartItem } from '../../models/models';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, ImageUrlPipe],
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
    cartItems$!: Observable<CartItem[]>;

    constructor(
        public cartService: CartService,
        private authService: AuthService,
        private orderService: OrderService,
        private router: Router
    ) { }

    ngOnInit() {
        this.cartItems$ = this.cartService.cartItems$;
    }

    checkout() {
        const user = this.authService.getCurrentUser();
        if (!user) {
            this.router.navigate(['/login']);
            return;
        }
        this.showCheckoutForm = true;
    }

    showCheckoutForm = false;
    deliveryDetails = {
        phoneNumber: '',
        region: '',
        address: '',
        postalCode: ''
    };

    tunisianRegions = [
        'Ariana', 'Beja', 'Ben Arous', 'Bizerte', 'Gabes', 'Gafsa',
        'Jendouba', 'Kairouan', 'Kasserine', 'Kebili', 'Kef', 'Mahdia',
        'Manouba', 'Medenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid',
        'Siliana', 'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'
    ];

    submitOrder() {
        const user = this.authService.getCurrentUser();
        if (!user) return;

        if (!this.deliveryDetails.phoneNumber || !this.deliveryDetails.address) {
            alert('Please fill in all required fields.');
            return;
        }

        // Call backend to place order
        this.orderService.placeOrder(user.id, this.deliveryDetails).subscribe({
            next: (order) => {
                alert('Order placed successfully! Redirecting to your orders...');
                this.cartService.clearCart();
                this.router.navigate(['/my-orders']);
            },
            error: (err) => {
                console.error('Checkout failed', err);
                alert('Failed to place order. Please try again.');
            }
        });
    }

    cancelCheckout() {
        this.showCheckoutForm = false;
    }

    increaseQty(item: CartItem) {
        this.cartService.updateQuantity(item, item.quantity + 1);
    }

    decreaseQty(item: CartItem) {
        if (item.quantity > 1) {
            this.cartService.updateQuantity(item, item.quantity - 1);
        }
    }
}
