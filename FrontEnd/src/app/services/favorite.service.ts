import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product, Favorite } from '../models/models';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class FavoriteService {
    private favoriteItems = new BehaviorSubject<Product[]>([]);
    favoriteItems$ = this.favoriteItems.asObservable();
    private apiUrl = `${environment.apiUrl}/favorites`;

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        if (isPlatformBrowser(this.platformId)) {
            // Initial load from API if user is logged in
            this.authService.currentUser$.subscribe(user => {
                if (user) {
                    this.loadFavorites(user.id);
                } else {
                    this.favoriteItems.next([]);
                }
            });
        }
    }

    loadFavorites(userId: number) {
        this.http.get<Favorite[]>(`${this.apiUrl}/${userId}`).subscribe({
            next: (favorites) => {
                const products = favorites.map(f => f.product);
                this.favoriteItems.next(products);
            },
            error: (err) => console.error('Error loading favorites', err)
        });
    }

    isFavorite(productId: number): boolean {
        return this.favoriteItems.value.some(p => p.id === productId);
    }

    addFavorite(product: Product) {
        const user = this.authService.getCurrentUser();
        if (!user) {
            alert('Please login to add to favorites');
            return;
        }

        if (!this.isFavorite(product.id)) {
            this.http.post(`${this.apiUrl}/${user.id}/${product.id}`, {}).subscribe({
                next: () => {
                    const currentItems = this.favoriteItems.value;
                    this.favoriteItems.next([...currentItems, product]);
                },
                error: (err) => console.error('Error adding to favorites', err)
            });
        }
    }

    removeFavorite(productId: number) {
        const user = this.authService.getCurrentUser();
        if (!user) return;

        this.http.delete(`${this.apiUrl}/${user.id}/${productId}`).subscribe({
            next: () => {
                const currentItems = this.favoriteItems.value;
                this.favoriteItems.next(currentItems.filter(item => item.id !== productId));
            },
            error: (err) => console.error('Error removing from favorites', err)
        });
    }
}
