import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { ImageUrlPipe } from '../../pipes/image-url-pipe';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/models';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterLink, ImageUrlPipe],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
    featuredProducts: Product[] = [];
    @ViewChild('productGrid') productGrid!: ElementRef;
    private scrollInterval: any;
    private isBrowser: boolean;

    constructor(
        private productService: ProductService,
        @Inject(PLATFORM_ID) platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        this.productService.getAllProducts().subscribe(products => {
            // Filter: Show product if AT LEAST ONE variant has stock > 0
            const availableProducts = products.filter(p => p.variants && p.variants.length > 0 && p.variants.some(v => v.stockQuantity > 0));
            this.featuredProducts = this.shuffleArray(availableProducts);
            // Wait for DOM to render the list before starting scroll
            if (this.isBrowser) {
                setTimeout(() => {
                    this.startAutoScroll();
                }, 500);
            }
        });
    }

    ngAfterViewInit() {
        // Removed initial call, handled in ngOnInit subscribe to ensure data is ready
    }

    ngOnDestroy() {
        this.stopAutoScroll();
    }

    private shuffleArray(array: any[]): any[] {
        let currentIndex = array.length, randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    startAutoScroll() {
        this.stopAutoScroll();

        this.scrollInterval = setInterval(() => {
            if (this.productGrid && this.productGrid.nativeElement) {
                const element = this.productGrid.nativeElement;
                const cardWidth = 320;
                const gap = 40;
                const scrollStep = cardWidth + gap; // 360px

                // Check if we are near the end
                // If scrollLeft + clientWidth is close to scrollWidth
                if (element.scrollLeft + element.clientWidth >= element.scrollWidth - 10) {
                    // Smoothly scroll back to start
                    element.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    element.scrollBy({ left: scrollStep, behavior: 'smooth' });
                }
            }
        }, 3000); // 3 seconds interval
    }

    stopAutoScroll() {
        if (this.scrollInterval) {
            clearInterval(this.scrollInterval);
        }
    }

    pauseAutoScroll() {
        this.stopAutoScroll();
    }

    resumeAutoScroll() {
        this.startAutoScroll();
    }
}
