import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { ProductService } from '../../services/product.service';
import { FavoriteService } from '../../services/favorite.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Product, Category } from '../../models/models';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ImageUrlPipe } from '../../pipes/image-url-pipe';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, ImageUrlPipe], // Add FormsModule
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {
    products: Product[] = [];
    categories: Category[] = [];
    selectedCategoryId: number | null = null;
    searchQuery: string | null = null;

    isLoading = false;
    hasSearched = false;

    private searchSubject = new Subject<string>();
    private searchSubscription: Subscription | undefined;

    constructor(
        private productService: ProductService,
        public favoriteService: FavoriteService,
        public authService: AuthService,
        private cartService: CartService,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        // Advanced AJAX Search Setup
        this.searchSubscription = this.searchSubject.pipe(
            debounceTime(300), // Wait 300ms after last keystroke
            distinctUntilChanged(), // Only if value changed
            switchMap(query => {
                this.isLoading = true;
                this.hasSearched = true;
                this.selectedCategoryId = null; // Reset category
                if (!query || query.trim() === '') {
                    this.hasSearched = false;
                    return this.productService.getAllProducts();
                }
                return this.productService.searchProducts(query);
            })
        ).subscribe({
            next: (products) => {
                this.products = products.filter(p => p.variants && p.variants.length > 0 && p.variants.some(v => v.stockQuantity > 0));
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Search Error:', err);
                this.isLoading = false;
            }
        });

        this.route.queryParams.subscribe(params => {
            if (params['search']) {
                this.searchQuery = params['search'];
                // Trigger immediate search for URL param
                this.loadProducts();
            } else {
                this.loadProducts();
            }
        });

        this.productService.getAllCategories().subscribe(cats => this.categories = cats);
    }

    ngOnDestroy() {
        if (this.searchSubscription) {
            this.searchSubscription.unsubscribe();
        }
    }

    onSearchInput(query: string) {
        this.searchSubject.next(query);
    }

    onSearch() {
        // Manual trigger (Enter key or Button)
        if (this.searchQuery) {
            this.searchSubject.next(this.searchQuery);
        }
    }

    clearSearch() {
        this.searchQuery = '';
        this.searchSubject.next('');
    }

    addToCart(product: Product) {
        this.cartService.addToCart(product);
    }

    visibleLimit = 6;

    // ... existing code ...

    loadProducts() {
        this.isLoading = true;
        this.products = []; // Clear current list while loading

        let observer;
        if (this.searchQuery && this.searchQuery.trim().length > 0) {
            this.hasSearched = true;
            observer = this.productService.searchProducts(this.searchQuery);
        } else if (this.selectedCategoryId) {
            this.hasSearched = false;
            observer = this.productService.getProductsByCategory(this.selectedCategoryId);
        } else {
            this.hasSearched = false;
            observer = this.productService.getAllProducts();
        }

        observer.subscribe({
            next: (products) => {
                // Filter: Show product if AT LEAST ONE variant has stock > 0
                this.products = products.filter(p => p.variants && p.variants.length > 0 && p.variants.some(v => v.stockQuantity > 0));
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading products', err);
                this.isLoading = false;
            }
        });
    }

    showAllProducts() {
        this.visibleLimit = this.products.length;
    }

    showLessProducts() {
        this.visibleLimit = 6;
        // Optional: Scroll back to top of grid?
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    filterCategory(id: number | null) {
        this.selectedCategoryId = id;
        this.searchQuery = null; // Clear search when filtering by category
        this.loadProducts();
    }

    deleteProduct(id: number) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            this.productService.deleteProduct(id).subscribe(() => {
                this.loadProducts();
            });
        }
    }
}
