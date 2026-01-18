import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUrlPipe } from '../../pipes/image-url-pipe';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order } from '../../models/order';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-my-orders',
    standalone: true,
    imports: [CommonModule, FormsModule, ImageUrlPipe],
    templateUrl: './my-orders.component.html',
    styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit, OnDestroy {
    orders: Order[] = [];
    filteredOrders: Order[] = [];
    loading = true;
    searchQuery: string = '';

    private searchSubject = new Subject<string>();
    private searchSubscription: Subscription | undefined;

    constructor(
        private orderService: OrderService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        const user = this.authService.getCurrentUser();
        if (user) {
            this.orderService.getUserOrders(user.id).subscribe({
                next: (orders) => {
                    this.orders = orders;
                    this.filteredOrders = orders;
                    this.loading = false;
                },
                error: (err) => {
                    console.error(err);
                    this.loading = false;
                }
            });
        }

        // Search Debounce Setup
        this.searchSubscription = this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(query => {
            this.performSearch(query);
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

    onSearch() {
        // Immediate search (Enter key or button)
        this.performSearch(this.searchQuery);
    }

    performSearch(query: string) {
        if (!query || query.trim() === '') {
            this.filteredOrders = this.orders;
            return;
        }

        const lowerQuery = query.toLowerCase();
        this.filteredOrders = this.orders.filter(order =>
            (order.trackingCode && order.trackingCode.toLowerCase().includes(lowerQuery)) ||
            (order.status && order.status.toLowerCase().includes(lowerQuery)) ||
            (order.totalAmount && order.totalAmount.toString().includes(lowerQuery))
        );
    }

    clearSearch() {
        this.searchQuery = '';
        this.searchSubject.next('');
        this.filteredOrders = this.orders;
    }
    visibleLimit = 2;

    showAllOrders() {
        this.visibleLimit = this.filteredOrders.length;
    }

    showLessOrders() {
        this.visibleLimit = 2;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
