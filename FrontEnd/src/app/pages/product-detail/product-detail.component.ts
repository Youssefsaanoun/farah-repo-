import { Component, OnInit } from '@angular/core';
import { ImageUrlPipe } from '../../pipes/image-url-pipe';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/models';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, ImageUrlPipe],
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
    product: Product | null = null;
    selectedImageIndex = 0;

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService,
        private cartService: CartService
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const id = Number(params.get('id'));
            if (id) {
                this.productService.getProductById(id).subscribe(p => this.product = p);
            }
        });
    }

    addToCart() {
        if (this.product) {
            this.cartService.addToCart(this.product);
            alert('Added to cart!');
        }
    }

    selectImage(index: number) {
        this.selectedImageIndex = index;
    }
}
