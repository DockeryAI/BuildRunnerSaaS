/**
 * Database schema types and interfaces for the application
 */

/**
 * Base model interface with common fields
 */
interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User model interface
 */
interface User extends BaseModel {
  email: string;
  firstName: string;
  lastName: string;
  password: string; // Hashed
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
}

/**
 * User role enum
 */
enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

/**
 * Product model interface
 */
interface Product extends BaseModel {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  inStock: boolean;
  imageUrl?: string;
}

/**
 * Product category model interface
 */
interface ProductCategory extends BaseModel {
  name: string;
  description?: string;
  parentId?: string;
}

/**
 * Order model interface
 */
interface Order extends BaseModel {
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  shippingAddress: Address;
  billingAddress: Address;
  paymentStatus: PaymentStatus;
}

/**
 * Order item model interface
 */
interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

/**
 * Address model interface
 */
interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

/**
 * Order status enum
 */
enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

/**
 * Payment status enum
 */
enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

/**
 * Cart model interface
 */
interface Cart extends BaseModel {
  userId: string;
  items: CartItem[];
  total: number;
}

/**
 * Cart item model interface
 */
interface CartItem {
  productId: string;
  quantity: number;
}

/**
 * Review model interface
 */
interface Review extends BaseModel {
  userId: string;
  productId: string;
  rating: number;
  comment: string;
}

/**
 * Error types
 */
class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export {
  User,
  UserRole,
  Product,
  ProductCategory,
  Order,
  OrderItem,
  Address,
  OrderStatus,
  PaymentStatus,
  Cart,
  CartItem,
  Review,
  DatabaseError,
  ValidationError
};