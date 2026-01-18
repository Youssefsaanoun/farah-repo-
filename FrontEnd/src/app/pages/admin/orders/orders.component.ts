import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../services/order.service';
import { Order, OrderStatus } from '../../../models/order';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ImageUrlPipe } from '../../../pipes/image-url-pipe';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
    selector: 'app-admin-orders',
    standalone: true,
    imports: [CommonModule, FormsModule, ImageUrlPipe],
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss']
})
export class AdminOrdersComponent implements OnInit, OnDestroy {
    orders: Order[] = [];
    filteredOrders: Order[] = [];
    loading = true;
    searchQuery: string = '';

    private searchSubject = new Subject<string>();
    private searchSubscription: Subscription | undefined;

    constructor(private orderService: OrderService) { }

    ngOnInit(): void {
        this.loadOrders();

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



    deleteOrder(orderId: number) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.')) {
            this.orderService.deleteOrder(orderId).subscribe({
                next: () => {
                    this.loadOrders(); // Refresh list
                },
                error: (err) => console.error('Failed to delete order', err)
            });
        }
    }

    visibleLimit = 4;

    showAllOrders() {
        this.visibleLimit = this.filteredOrders.length;
    }

    showLessOrders() {
        this.visibleLimit = 4;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    loadOrders() {
        this.loading = true;
        this.orderService.getAllOrders().subscribe({
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

    onSearchInput(query: string) {
        this.searchSubject.next(query);
    }

    onSearch() {
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
            (order.user && (
                (order.user.firstName && order.user.firstName.toLowerCase().includes(lowerQuery)) ||
                (order.user.lastName && order.user.lastName.toLowerCase().includes(lowerQuery)) ||
                (order.user.email && order.user.email.toLowerCase().includes(lowerQuery))
            )) ||
            (order.totalAmount && order.totalAmount.toString().includes(lowerQuery))
        );
    }

    clearSearch() {
        this.searchQuery = '';
        this.searchSubject.next('');
        this.filteredOrders = this.orders;
    }

    updateStatus(order: Order, status: string) {
        if (!confirm(`Êtes-vous sûr de vouloir changer le statut à ${status} ?`)) return;

        this.orderService.updateStatus(order.id, status as OrderStatus).subscribe({
            next: (updatedOrder) => {
                order.status = updatedOrder.status;
            },
            error: (err) => alert('Échec de la mise à jour du statut')
        });
    }

    downloadPdf(order: Order) {
        const doc = new jsPDF();
        const logo = new Image();
        logo.src = 'assets/logo.png';

        logo.onload = () => {
            // Add Logo
            doc.addImage(logo, 'PNG', 14, 10, 25, 25); // Top left logo

            // Header - Moved down
            doc.setFontSize(20);
            doc.text('Détails de la Commande', 14, 45); // Adjusted Y

            doc.setFontSize(11);
            doc.setTextColor(100);

            // Order Info - Moved down
            doc.text(`Code Commande: ${order.trackingCode}`, 14, 55);
            doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, 14, 61);
            doc.text(`Statut: ${order.status}`, 14, 67);

            // Customer Info - Moved down
            if (order.user) {
                doc.text(`Client: ${order.user.firstName} ${order.user.lastName}`, 14, 75);
                doc.text(`Email: ${order.user.email}`, 14, 81);
                if (order.phoneNumber) doc.text(`Tél: ${order.phoneNumber}`, 14, 87);
                if (order.address) {
                    const addressStr = `Adresse: ${order.address}, ${order.region || ''} ${order.postalCode || ''}`;
                    doc.text(addressStr, 14, 93);
                }
            }

            // Table
            const tableBody = order.orderLines.map(line => [
                line.variant?.product?.name || 'Produit',
                `${line.variant?.size || '-'} / ${line.variant?.color || '-'}`,
                line.quantity,
                `${line.price} TND`,
                `${line.price * line.quantity} TND`
            ]);

            autoTable(doc, {
                head: [['Produit', 'Variante', 'Qté', 'Prix Unitaire', 'Total']],
                body: tableBody,
                startY: 105, // Moved down relative to new header
                theme: 'grid',
                headStyles: { fillColor: [212, 175, 55] }
            });

            // Total
            const finalY = (doc as any).lastAutoTable.finalY + 10;
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text(`Montant Total: ${order.totalAmount} TND`, 14, finalY);

            // Footer
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text('Merci de votre achat chez Farah Couture.', 14, finalY + 10);

            doc.save(`Order_${order.trackingCode}.pdf`);
        };

        // Fallback if image fails to load
        logo.onerror = () => {
            console.error('Failed to load logo for PDF');
            // Header
            doc.setFontSize(20);
            doc.text('Détails de la Commande', 14, 22);

            doc.setFontSize(11);
            doc.setTextColor(100);

            // Order Info
            doc.text(`Code Commande: ${order.trackingCode}`, 14, 32);
            doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, 14, 38);
            doc.text(`Statut: ${order.status}`, 14, 44);

            // Customer Info
            if (order.user) {
                doc.text(`Client: ${order.user.firstName} ${order.user.lastName}`, 14, 52);
                doc.text(`Email: ${order.user.email}`, 14, 58);
                if (order.phoneNumber) doc.text(`Tél: ${order.phoneNumber}`, 14, 64);
                if (order.address) {
                    const addressStr = `Adresse: ${order.address}, ${order.region || ''} ${order.postalCode || ''}`;
                    doc.text(addressStr, 14, 70);
                }
            }

            // Table
            const tableBody = order.orderLines.map(line => [
                line.variant?.product?.name || 'Produit',
                `${line.variant?.size || '-'} / ${line.variant?.color || '-'}`,
                line.quantity,
                `${line.price} TND`,
                `${line.price * line.quantity} TND`
            ]);

            autoTable(doc, {
                head: [['Produit', 'Variante', 'Qté', 'Prix Unitaire', 'Total']],
                body: tableBody,
                startY: 80,
                theme: 'grid',
                headStyles: { fillColor: [212, 175, 55] }
            });

            // Total
            const finalY = (doc as any).lastAutoTable.finalY + 10;
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text(`Montant Total: ${order.totalAmount} TND`, 14, finalY);

            doc.text('Merci de votre achat chez Farah Couture.', 14, finalY + 10);
            doc.save(`Order_${order.trackingCode}.pdf`);
        };
    }
}
