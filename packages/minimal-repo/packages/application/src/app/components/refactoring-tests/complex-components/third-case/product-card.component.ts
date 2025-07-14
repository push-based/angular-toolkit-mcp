import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  output,
  signal,
  booleanAttribute,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DsBadge } from '@frontend/ui/badge';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  imageUrl: string;
  tags: string[];
}

export const PRODUCT_BADGE_TYPES = ['sale', 'new', 'bestseller', 'limited'] as const;
export type ProductBadgeType = (typeof PRODUCT_BADGE_TYPES)[number];

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, FormsModule, DsBadge],
  template: `
    <div class="product-card" [class.product-card-selected]="selected()">
      <!-- Product Image with Badge Overlay -->
      <div class="product-image-container">
        <img 
          [src]="product().imageUrl" 
          [alt]="product().name"
          class="product-image"
          (error)="onImageError($event)">
        
        <!-- DsBadge Implementation -->
        @if (showBadge()) {
          <div class="badge-overlay">
            <ds-badge 
              [size]="compact() ? 'xsmall' : 'medium'"
              [variant]="getBadgeVariant()">
              
              <!-- Icon slot (start) -->
              <span slot="start">
                @switch (badgeType()) {
                  @case ('sale') {
                    🔥
                  }
                  @case ('new') {
                    ✨
                  }
                  @case ('bestseller') {
                    ⭐
                  }
                  @case ('limited') {
                    ⏰
                  }
                }
              </span>
              
              <!-- Main badge text -->
              {{ getBadgeText() }}
              
              <!-- Optional percentage for sale badges (end slot) -->
              @if (badgeType() === 'sale' && product().originalPrice) {
                <span slot="end">
                  -{{ getSalePercentage() }}%
                </span>
              }
            </ds-badge>
          </div>
        }
        
        <!-- Stock status indicator -->
        @if (!product().inStock) {
          <div class="stock-overlay">
            <span class="stock-badge">Out of Stock</span>
          </div>
        }
      </div>

      <!-- Product Content -->
      <div class="product-content">
        <div class="product-header">
          <h3 class="product-name">{{ product().name }}</h3>
          <button 
            class="favorite-button"
            [class.favorite-active]="favorited()"
            (click)="toggleFavorite()"
            [attr.aria-label]="favorited() ? 'Remove from favorites' : 'Add to favorites'">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M10 15l-5.5 3 1-6L1 7.5l6-.5L10 1l3 6 6 .5-4.5 4.5 1 6z" 
                    [attr.fill]="favorited() ? '#ef4444' : 'none'"
                    [attr.stroke]="favorited() ? '#ef4444' : 'currentColor'"
                    stroke-width="1.5"/>
            </svg>
          </button>
        </div>
        
        <div class="product-category">{{ product().category }}</div>
        
        <!-- Price section with conditional styling -->
        <div class="product-pricing">
          @if (product().originalPrice && product().originalPrice > product().price) {
            <span class="original-price">\${{ product().originalPrice.toFixed(2) }}</span>
          }
          <span class="current-price">\${{ product().price.toFixed(2) }}</span>
        </div>
        
        <!-- Rating and reviews -->
        <div class="product-rating">
          <div class="rating-stars">
            @for (star of getStarArray(); track $index) {
              <span class="star" [class.star-filled]="star">★</span>
            }
          </div>
          <span class="rating-text">{{ product().rating.toFixed(1) }} ({{ product().reviewCount }})</span>
        </div>
        
        <!-- Product tags -->
        @if (product().tags.length > 0) {
          <div class="product-tags">
            @for (tag of product().tags.slice(0, 3); track tag) {
              <span class="product-tag">{{ tag }}</span>
            }
            @if (product().tags.length > 3) {
              <span class="tag-more">+{{ product().tags.length - 3 }} more</span>
            }
          </div>
        }
      </div>

      <!-- Product Actions -->
      <div class="product-actions">
        <button 
          class="action-button add-to-cart"
          [disabled]="!product().inStock"
          (click)="addToCart()"
          [attr.aria-label]="'Add ' + product().name + ' to cart'">
          @if (product().inStock) {
            Add to Cart
          } @else {
            Notify When Available
          }
        </button>
        
        <button 
          class="action-button quick-view"
          (click)="quickView()"
          [attr.aria-label]="'Quick view ' + product().name">
          Quick View
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./product-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent implements OnInit {
  // Product data
  product = input.required<Product>();
  
  // Badge configuration
  badgeType = input<ProductBadgeType>('sale');
  showBadge = input(true, { transform: booleanAttribute });
  animated = input(true, { transform: booleanAttribute });
  compact = input(false, { transform: booleanAttribute });
  
  // Card state
  selected = input(false, { transform: booleanAttribute });
  favorited = signal(false);
  
  // Outputs
  productSelected = output<Product>();
  favoriteToggled = output<{product: Product, favorited: boolean}>();
  addToCartClicked = output<Product>();
  quickViewClicked = output<Product>();

  ngOnInit() {
    // Initialize favorited state from localStorage or API
    const savedFavorites = localStorage.getItem('favoriteProducts');
    if (savedFavorites) {
      const favorites = JSON.parse(savedFavorites) as string[];
      this.favorited.set(favorites.includes(this.product().id));
    }
  }

  getBadgeText(): string {
    const typeMap: Record<ProductBadgeType, string> = {
      'sale': 'Sale',
      'new': 'New',
      'bestseller': 'Best Seller',
      'limited': 'Limited Time'
    };
    return typeMap[this.badgeType()];
  }

  getBadgeVariant() {
    const variantMap: Record<ProductBadgeType, string> = {
      'sale': 'red-strong',
      'new': 'green-strong',
      'bestseller': 'yellow-strong',
      'limited': 'purple-strong'
    };
    return variantMap[this.badgeType()];
  }

  getBadgeAriaLabel(): string {
    const text = this.getBadgeText();
    if (this.badgeType() === 'sale' && this.product().originalPrice) {
      return `${text} badge: ${this.getSalePercentage()}% off`;
    }
    return `${text} badge`;
  }

  getSalePercentage(): number {
    const original = this.product().originalPrice;
    const current = this.product().price;
    if (!original || original <= current) return 0;
    return Math.round(((original - current) / original) * 100);
  }

  getStarArray(): boolean[] {
    const rating = this.product().rating;
    const stars: boolean[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
    }
    return stars;
  }

  toggleFavorite() {
    const newFavorited = !this.favorited();
    this.favorited.set(newFavorited);
    
    // Update localStorage
    const savedFavorites = localStorage.getItem('favoriteProducts');
    const favorites = savedFavorites ? JSON.parse(savedFavorites) as string[] : [];
    
    if (newFavorited) {
      if (!favorites.includes(this.product().id)) {
        favorites.push(this.product().id);
      }
    } else {
      const index = favorites.indexOf(this.product().id);
      if (index > -1) {
        favorites.splice(index, 1);
      }
    }
    
    localStorage.setItem('favoriteProducts', JSON.stringify(favorites));
    this.favoriteToggled.emit({product: this.product(), favorited: newFavorited});
  }

  addToCart() {
    if (this.product().inStock) {
      this.addToCartClicked.emit(this.product());
    }
  }

  quickView() {
    this.quickViewClicked.emit(this.product());
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/300x200?text=No+Image';
  }
} 