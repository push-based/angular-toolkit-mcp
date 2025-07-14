import { Component, signal } from '@angular/core';
import { ProductCardComponent, Product, ProductBadgeType } from './product-card.component';

@Component({
  selector: 'app-product-showcase',
  standalone: true,
  imports: [ProductCardComponent],
  template: `
    <div class="showcase-container">
      <h2>Product Card Showcase - Moderate Badge Complexity</h2>
      <p>This demonstrates a moderate level of badge complexity that should be more manageable to refactor to DsBadge.</p>
      
      <div class="showcase-grid">
        @for (product of products(); track product.id) {
          <app-product-card
            [product]="product"
            [badgeType]="getBadgeType(product)"
            [showBadge]="shouldShowBadge(product)"
            [animated]="true"
            [compact]="false"
            (productSelected)="onProductSelected($event)"
            (favoriteToggled)="onFavoriteToggled($event)"
            (addToCartClicked)="onAddToCart($event)"
            (quickViewClicked)="onQuickView($event)">
          </app-product-card>
        }
      </div>
      
      <div class="showcase-log">
        <h3>Event Log:</h3>
        <div class="log-entries">
          @for (entry of eventLog(); track $index) {
            <div class="log-entry">{{ entry }}</div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .showcase-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .showcase-container h2 {
      color: #1f2937;
      margin-bottom: 1rem;
    }
    
    .showcase-container p {
      color: #6b7280;
      margin-bottom: 2rem;
    }
    
    .showcase-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .showcase-log {
      background: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }
    
    .showcase-log h3 {
      margin: 0 0 1rem 0;
      color: #1f2937;
      font-size: 1.125rem;
    }
    
    .log-entries {
      max-height: 200px;
      overflow-y: auto;
    }
    
    .log-entry {
      padding: 0.5rem;
      border-bottom: 1px solid #f3f4f6;
      font-size: 0.875rem;
      color: #374151;
      font-family: monospace;
    }
    
    .log-entry:last-child {
      border-bottom: none;
    }
  `]
})
export class ProductShowcaseComponent {
  eventLog = signal<string[]>([]);
  
  products = signal<Product[]>([
    {
      id: 'prod-1',
      name: 'Premium Wireless Headphones',
      price: 199.99,
      originalPrice: 249.99,
      category: 'Electronics',
      rating: 4.5,
      reviewCount: 128,
      inStock: true,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop',
      tags: ['wireless', 'premium', 'noise-canceling']
    },
    {
      id: 'prod-2',
      name: 'Smart Fitness Watch',
      price: 299.99,
      category: 'Wearables',
      rating: 4.8,
      reviewCount: 256,
      inStock: true,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop',
      tags: ['fitness', 'smart', 'waterproof', 'gps']
    },
    {
      id: 'prod-3',
      name: 'Professional Camera Lens',
      price: 899.99,
      category: 'Photography',
      rating: 4.9,
      reviewCount: 89,
      inStock: true,
      imageUrl: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=300&h=200&fit=crop',
      tags: ['professional', 'telephoto', 'canon']
    },
    {
      id: 'prod-4',
      name: 'Gaming Mechanical Keyboard',
      price: 149.99,
      originalPrice: 179.99,
      category: 'Gaming',
      rating: 4.6,
      reviewCount: 342,
      inStock: false,
      imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=200&fit=crop',
      tags: ['mechanical', 'rgb', 'gaming', 'cherry-mx']
    },
    {
      id: 'prod-5',
      name: 'Eco-Friendly Water Bottle',
      price: 24.99,
      category: 'Lifestyle',
      rating: 4.3,
      reviewCount: 67,
      inStock: true,
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=200&fit=crop',
      tags: ['eco-friendly', 'stainless-steel', 'insulated']
    },
    {
      id: 'prod-6',
      name: 'Designer Laptop Backpack',
      price: 79.99,
      originalPrice: 99.99,
      category: 'Accessories',
      rating: 4.4,
      reviewCount: 156,
      inStock: true,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop',
      tags: ['designer', 'laptop', 'travel', 'waterproof']
    }
  ]);

  getBadgeType(product: Product): ProductBadgeType {
    // Logic to determine badge type based on product characteristics
    if (product.originalPrice && product.originalPrice > product.price) {
      return 'sale';
    }
    if (product.rating >= 4.8) {
      return 'bestseller';
    }
    if (!product.inStock) {
      return 'limited';
    }
    if (product.tags.includes('new') || Date.now() % 2 === 0) { // Simulate new products
      return 'new';
    }
    return 'sale';
  }

  shouldShowBadge(product: Product): boolean {
    // Show badge for sale items, high-rated items, or out of stock
    return !!(product.originalPrice && product.originalPrice > product.price) ||
           product.rating >= 4.7 ||
           !product.inStock;
  }

  onProductSelected(product: Product) {
    this.addLogEntry(`Product selected: ${product.name}`);
  }

  onFavoriteToggled(event: {product: Product, favorited: boolean}) {
    this.addLogEntry(`${event.product.name} ${event.favorited ? 'added to' : 'removed from'} favorites`);
  }

  onAddToCart(product: Product) {
    this.addLogEntry(`Added to cart: ${product.name} - $${product.price.toFixed(2)}`);
  }

  onQuickView(product: Product) {
    this.addLogEntry(`Quick view opened: ${product.name}`);
  }

  private addLogEntry(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    const entry = `[${timestamp}] ${message}`;
    this.eventLog.update(log => [entry, ...log.slice(0, 49)]);
  }
} 