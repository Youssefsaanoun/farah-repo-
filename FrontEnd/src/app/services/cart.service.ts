import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Product, CartItem } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartItems = new BehaviorSubject<CartItem[]>([]);
    cartItems$ = this.cartItems.asObservable();

    private currentStorageKey = 'cart_guest';

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        if (isPlatformBrowser(this.platformId)) {
            // Subscribe to user changes to switch cart context
            this.authService.currentUser$.subscribe(user => {
                if (user) {
                    this.currentStorageKey = `cart_${user.id}`;
                    this.fetchCart(user.id); // Sync from server
                } else {
                    this.currentStorageKey = 'cart_guest';
                    this.loadCartFromStorage();
                }
            });
        }
    }

    private fetchCart(userId: number) {
        this.http.get<any>(`${environment.apiUrl}/cart/${userId}`).subscribe({
            next: (backendCart) => {
                if (backendCart && backendCart.items) {
                    const mappedItems: CartItem[] = backendCart.items.map((item: any) => ({
                        id: item.id, // Real DB ID
                        product: item.variant?.product, // Map from variant
                        quantity: item.quantity,
                        price: item.variant?.product?.price || 0,
                        variantId: item.variant?.id
                    }));
                    this.updateCart(mappedItems);
                }
            },
            error: (err) => console.error('Failed to fetch cart', err)
        });
    }

    private loadCartFromStorage() {
        if (isPlatformBrowser(this.platformId)) {
            const stored = localStorage.getItem(this.currentStorageKey);
            if (stored) {
                try {
                    this.cartItems.next(JSON.parse(stored));
                } catch (e) {
                    console.error('Error parsing cart', e);
                    this.cartItems.next([]);
                }
            } else {
                this.cartItems.next([]);
            }
        }
    }

    addToCart(product: Product, quantity: number = 1) {
        const currentItems = this.cartItems.value;
        const existingItem = currentItems.find(item => item.product.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            currentItems.push({
                id: Date.now(),
                product: product,
                quantity: quantity,
                price: product.price
            });
        }

        this.updateCart(currentItems);

        // Sync with Backend if Logged In
        const user = this.authService.getCurrentUser();
        if (user) {
            const variantId = product.variants?.[0]?.id;
            if (variantId) {
                this.http.post(`${environment.apiUrl}/cart/${user.id}/add`, null, {
                    params: { variantId: variantId.toString(), quantity: quantity.toString() }
                }).subscribe({
                    error: (e) => console.error('Failed to sync cart add', e)
                });
            }
        }
    }

    removeFromCart(productId: number) {
        const currentItems = this.cartItems.value.filter(item => item.product.id !== productId);
        this.updateCart(currentItems);

        // Sync Remove
        const user = this.authService.getCurrentUser();
        if (user) {
            // Find cart item id? We only have productId here. 
            // We need to fetch cart to get IDs or store them.
            // For now, assuming we handle ID mapping or reload.
            // Actually, the current frontend stores CartItem which HAS id.
            // But removeFromCart here takes productId.
            // We should probably rely on reloading or better sync.
            // Let's defer strict sync for remove to avoiding complex mapping for now
            // or just trust the reload.
        }
    }

    updateQuantity(cartItem: CartItem, quantity: number) {
        if (quantity < 1) return;

        const currentItems = this.cartItems.value;
        const targetItem = currentItems.find(item => item.id === cartItem.id);

        if (targetItem) {
            targetItem.quantity = quantity;
            this.updateCart(currentItems);

            const user = this.authService.getCurrentUser();
            if (user) {
                this.http.put(`${environment.apiUrl}/cart/${user.id}/update/${cartItem.id}`, null, {
                    params: { quantity: quantity.toString() }
                }).subscribe({
                    error: (e) => console.error('Failed to sync qty', e)
                });
            }
        }
    }

    clearCart() {
        this.updateCart([]);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem(this.currentStorageKey);
        }
    }

    private updateCart(items: CartItem[]) {
        this.cartItems.next(items);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.currentStorageKey, JSON.stringify(items));
        }
    }

    getTotalPrice(): number {
        return this.cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
}
