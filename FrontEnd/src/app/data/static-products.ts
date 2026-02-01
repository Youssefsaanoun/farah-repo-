import { Category, Product } from '../models/models';

/** Static categories (same as backend DataInitializer). */
export const STATIC_CATEGORIES: Category[] = [
  { id: 1, name: 'Robes de Soirée', description: 'Robes élégantes pour les soirées' },
  { id: 2, name: 'Robes Mariage', description: 'Robes blanches pour mariées' },
  { id: 3, name: 'Robes Casual', description: 'Pour tous les jours' }
];

/** Static products shown when API does not load / refresh. */
export const STATIC_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Robe Soirée Élégante',
    description: 'Robe de soirée élégante pour occasions spéciales.',
    price: 299.99,
    category: STATIC_CATEGORIES[0],
    variants: [{ id: 1, color: 'Noir', size: 'M', stockQuantity: 5 }],
    images: [{ id: 1, imageUrl: 'assets/placeholder.png' }]
  },
  {
    id: 2,
    name: 'Robe Mariée Classique',
    description: 'Robe blanche classique pour votre grand jour.',
    price: 599.99,
    category: STATIC_CATEGORIES[1],
    variants: [{ id: 2, color: 'Blanc', size: 'S', stockQuantity: 3 }, { id: 3, color: 'Blanc', size: 'M', stockQuantity: 4 }],
    images: [{ id: 2, imageUrl: 'assets/placeholder.png' }]
  },
  {
    id: 3,
    name: 'Robe Casual Quotidienne',
    description: 'Confortable pour tous les jours.',
    price: 89.99,
    category: STATIC_CATEGORIES[2],
    variants: [{ id: 4, color: 'Bleu', size: 'M', stockQuantity: 10 }],
    images: [{ id: 3, imageUrl: 'assets/placeholder.png' }]
  },
  {
    id: 4,
    name: 'Robe Soirée Rouge',
    description: 'Robe rouge pour vos soirées.',
    price: 249.99,
    category: STATIC_CATEGORIES[0],
    variants: [{ id: 5, color: 'Rouge', size: 'L', stockQuantity: 2 }],
    images: [{ id: 4, imageUrl: 'assets/placeholder.png' }]
  },
  {
    id: 5,
    name: 'Robe Mariée Moderne',
    description: 'Design moderne pour mariées.',
    price: 799.99,
    category: STATIC_CATEGORIES[1],
    variants: [{ id: 6, color: 'Ivoire', size: 'M', stockQuantity: 1 }],
    images: [{ id: 5, imageUrl: 'assets/placeholder.png' }]
  },
  {
    id: 6,
    name: 'Robe Casual Été',
    description: 'Légère et confortable pour l\'été.',
    price: 69.99,
    category: STATIC_CATEGORIES[2],
    variants: [{ id: 7, color: 'Blanc', size: 'S', stockQuantity: 8 }],
    images: [{ id: 6, imageUrl: 'assets/placeholder.png' }]
  }
];
