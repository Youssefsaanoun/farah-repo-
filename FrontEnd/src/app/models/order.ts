export enum OrderStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    CANCELLED = 'CANCELLED'
}

export interface OrderLine {
    id: number;
    variant: {
        id: number;
        product: {
            id: number;
            name: string;
            images: any[];
        };
        size: string;
        color: string;
    };
    quantity: number;
    price: number;
}

export interface Order {
    id: number;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
    orderDate: string;
    status: OrderStatus;
    totalAmount: number;
    trackingCode: string;
    phoneNumber?: string;
    region?: string;
    address?: string;
    postalCode?: string;
    orderLines: OrderLine[];
}
