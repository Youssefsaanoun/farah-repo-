import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/models';
import { ImageUrlPipe } from '../../../pipes/image-url-pipe';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, ImageUrlPipe, FormsModule],
  templateUrl: './stock.html',
  styleUrls: ['./stock.scss']
})
export class StockComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  loading = true;
  searchQuery: string | null = null;
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | undefined;
  allProducts: Product[] = []; // Store full list for local filtering

  constructor(private productService: ProductService) { }

  ngOnInit() {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.processProducts(data);
        this.allProducts = [...this.products]; // Backup full list
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load products', err);
        this.loading = false;
      }
    });

    // Client-side Search Setup
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.filterProducts(query);
    });
  }

  filterProducts(query: string) {
    if (!query || query.trim() === '') {
      this.products = [...this.allProducts];
      return;
    }

    const lowerQuery = query.toLowerCase();

    this.products = this.allProducts.filter(p => {
      const nameMatch = (p.name || '').toLowerCase().includes(lowerQuery);
      const categoryMatch = (p.category?.name || '').toLowerCase().includes(lowerQuery);
      const stock = this.getStock(p);
      const qtyMatch = stock.toString().includes(lowerQuery);

      let statusString = stock > 0 ? 'in stock' : 'out of stock';
      const statusMatch = statusString.includes(lowerQuery);

      return nameMatch || categoryMatch || qtyMatch || statusMatch;
    });
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onSearchInput(query: string) {
    this.searchSubject.next(query);
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchSubject.next('');
  }

  visibleLimit = 7;

  showAllProducts() {
    this.visibleLimit = this.products.length;
  }

  showLessProducts() {
    this.visibleLimit = 7;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Refactored product processing to be reusable
  processProducts(data: Product[]) {
    this.products = data.map(p => {
      if (!p.variants || p.variants.length === 0) {
        p.variants = [{ id: 0, size: 'Standard', color: 'Default', stockQuantity: 0 }];
      }
      return p;
    });
  }



  // Helper can just return direct value now since we ensure variant exists
  getStock(product: Product): number {
    return product.variants[0].stockQuantity;
  }

  updateStock(product: Product, newQuantity: number) {
    if (newQuantity < 0) return;
    product.variants[0].stockQuantity = newQuantity;
    this.saveStock(product);
  }

  saveStock(product: Product) {
    const variant = product.variants[0];

    // Construct payload
    const payload: any = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      variants: [{
        size: 'Standard',
        color: 'Default',
        stockQuantity: variant.stockQuantity
      }]
    };

    // Only add ID if it's a real variant (id > 0)
    if (variant.id > 0) {
      payload.variants[0].id = variant.id;
    }

    this.productService.updateProduct(product.id, payload).subscribe({
      next: () => {
        // Silent success or maybe a small toast in future
        console.log('Stock auto-saved');
      },
      error: (err) => {
        console.error('Failed to update stock', err);
        // Revert on error? For now just log.
      }
    });
  }
}
