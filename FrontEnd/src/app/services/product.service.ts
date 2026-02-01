import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product, Category } from '../models/models';
import { environment } from '../../environments/environment';
import { STATIC_PRODUCTS, STATIC_CATEGORIES } from '../data/static-products';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = `${environment.apiUrl}/products`;

    constructor(private http: HttpClient) { }

    getAllProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this.apiUrl).pipe(
            catchError(() => of(STATIC_PRODUCTS))
        );
    }

    getProductById(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
            catchError(() => of(STATIC_PRODUCTS.find(p => p.id === id) ?? STATIC_PRODUCTS[0]))
        );
    }

    getProductsByCategory(categoryId: number): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/category/${categoryId}`).pipe(
            catchError(() => of(STATIC_PRODUCTS.filter(p => p.category.id === categoryId)))
        );
    }

    searchProducts(keyword: string): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/search?q=${keyword}`).pipe(
            catchError(() => {
                const q = (keyword || '').toLowerCase();
                return of(q ? STATIC_PRODUCTS.filter(p =>
                    p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
                ) : STATIC_PRODUCTS);
            })
        );
    }

    getAllCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(`${this.apiUrl}/categories`).pipe(
            catchError(() => of(STATIC_CATEGORIES))
        );
    }

    createProduct(product: any): Observable<Product> {
        return this.http.post<Product>(this.apiUrl, product);
    }

    updateProduct(id: number, product: any): Observable<Product> {
        return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
    }

    deleteProduct(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    uploadImage(file: File): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ url: string }>(`${this.apiUrl}/upload`, formData);
    }
}
