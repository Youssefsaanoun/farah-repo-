import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Order, OrderStatus } from '../models/order';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = `${environment.apiUrl}/orders`;

    // Reactive source for pending orders count
    private pendingOrdersCountSubject = new BehaviorSubject<number>(0);
    public pendingOrdersCount$ = this.pendingOrdersCountSubject.asObservable();

    constructor(private http: HttpClient) { }

    placeOrder(userId: number, deliveryDetails: { phoneNumber: string, region: string, address: string, postalCode: string }): Observable<Order> {
        return this.http.post<Order>(`${this.apiUrl}/${userId}/place`, deliveryDetails).pipe(
            tap(() => this.refreshPendingOrders()) // Refresh after placing order (if admin places it?)
        );
    }

    getUserOrders(userId: number): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/user/${userId}`);
    }

    getAllOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/all`);
    }

    updateStatus(orderId: number, status: OrderStatus): Observable<Order> {
        return this.http.put<Order>(`${this.apiUrl}/${orderId}/status`, { status }).pipe(
            tap(() => this.refreshPendingOrders()) // Auto-refresh count after status change
        );
    }

    deleteOrder(orderId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${orderId}`).pipe(
            tap(() => this.refreshPendingOrders()) // Auto-refresh count after deletion
        );
    }

    // Call this to update the count (e.g. periodically or on init)
    refreshPendingOrders() {
        this.getAllOrders().subscribe({
            next: (orders) => {
                const count = orders.filter(o => o.status === 'PENDING').length;
                this.pendingOrdersCountSubject.next(count);
            },
            error: (err) => console.error('Failed to refresh pending orders', err)
        });
    }
}
