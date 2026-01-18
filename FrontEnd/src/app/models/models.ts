export interface Category {
    id: number;
    name: string;
    description: string;
}

export interface Variant {
    id: number;
    color: string;
    size: string;
    stockQuantity: number;
}

export interface Image {
    id: number;
    imageUrl: string;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category: Category;
    variants: Variant[];
    images: Image[];
}

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isBlocked?: boolean;
}

export interface CartItem {
    id: number;
    product: Product;
    quantity: number;
    price: number;
    variantId?: number; // Optional if we track specific variant in cart
}

export interface Cart {
    id: number;
    user: User;
    items: CartItem[];
    totalPrice: number;
}

export interface Favorite {
    id: number;
    user: User;
    product: Product;
}
