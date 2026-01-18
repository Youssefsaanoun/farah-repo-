import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Category, Product } from '../../models/models';
import { ImageUrlPipe } from '../../pipes/image-url-pipe';

@Component({
    selector: 'app-product-manage',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ImageUrlPipe],
    templateUrl: './product-manage.component.html',
    styleUrls: ['./product-manage.component.scss']
})
export class ProductManageComponent implements OnInit {
    productForm: FormGroup;
    isEditMode = false;
    productId: number | null = null;
    defaultVariantId: number | null = null;
    categories: Category[] = [];
    imageUrl: string | null = null;

    constructor(
        private fb: FormBuilder,
        private productService: ProductService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.productForm = this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            price: [0, [Validators.required, Validators.min(0)]],
            quantity: [100, [Validators.required, Validators.min(0)]],
            categoryId: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.loadCategories();
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.isEditMode = true;
                this.productId = +id;
                this.loadProduct(this.productId);
            }
        });
    }

    loadCategories() {
        this.productService.getAllCategories().subscribe(cats => this.categories = cats);
    }

    loadProduct(id: number) {
        this.productService.getProductById(id).subscribe(product => {
            // Get quantity from first variant or default to 0
            let stock = 0;
            if (product.variants && product.variants.length > 0) {
                stock = product.variants[0].stockQuantity || 0;
                this.defaultVariantId = product.variants[0].id || null;
            }

            this.productForm.patchValue({
                name: product.name,
                description: product.description,
                price: product.price,
                quantity: stock,
                categoryId: product.category.id
            });
            if (product.images && product.images.length > 0) {
                this.imageUrl = product.images[0].imageUrl;
            }
        });
    }

    onFileSelected(event: any) {
        const file: File = event.target.files[0];
        if (file) {
            // Show preview immediately
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imageUrl = e.target.result;
            };
            reader.readAsDataURL(file);

            // Upload in background
            this.productService.uploadImage(file).subscribe({
                next: (response) => {
                    this.imageUrl = response.url; // Update with server URL after success
                },
                error: (err) => console.error('Upload failed', err)
            });
        }
    }

    onSubmit() {
        if (this.productForm.invalid) return;

        const productData = this.productForm.value;
        const quantity = Number(productData.quantity); // Ensure number

        console.log('Submitting Product Data:', productData);
        console.log('Quantity to save:', quantity);

        const variantPayload: any = {
            size: 'Standard',
            color: 'Default',
            stockQuantity: quantity
        };

        // If editing an existing variant, include its ID to update it
        if (this.defaultVariantId) {
            variantPayload.id = this.defaultVariantId;
        }

        const payload: any = {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            category: { id: productData.categoryId },
            images: this.imageUrl ? [{ imageUrl: this.imageUrl, isCover: true }] : [],
            // Create/Update default variant with the managed quantity
            variants: [variantPayload]
        };

        if (this.isEditMode && this.productId) {
            this.productService.updateProduct(this.productId, payload).subscribe(() => {
                this.router.navigate(['/products']);
            });
        } else {
            this.productService.createProduct(payload).subscribe(() => {
                this.router.navigate(['/products']);
            });
        }
    }
}
