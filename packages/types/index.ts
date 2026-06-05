export type UserRole = 'SUPER_ADMIN' | 'MERCHANT_OWNER' | 'STAFF';

export type ShopAccessRole = 'OWNER' | 'STAFF';

export type Permission = string;

export type DashboardMode = 'admin' | 'merchant';

export interface ApiMeta {
  requestId?: string;
  timestamp: string;
  path?: string;
  method?: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorPayload {
  statusCode: number;
  code: string;
  message: string | string[];
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
  meta: ApiMeta;
}

export interface AccessibleShop {
  shopId: string;
  shopName: string;
  role: ShopAccessRole;
  permissions: Permission[];
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  level: number;
}

export interface AllowedMenuChild {
  key: string;
  label: string;
  icon: string;
  path: string;
  permission?: Permission;
  requiresShop?: boolean;
}

export interface AllowedMenu {
  key: string;
  label: string;
  icon: string;
  mode: DashboardMode;
  path?: string;
  permission?: Permission;
  requiresShop?: boolean;
  children?: AllowedMenuChild[];
}

export interface SessionResponse {
  user: SessionUser;
  permissions: Permission[];
  allowedMenus: AllowedMenu[];
  accessibleShops: AccessibleShop[];
}

export interface ManagedUserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  level: number;
  permissions: Permission[];
  isActive: boolean;
  managedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface PlanSummary {
  id: string;
  name: string;
  price: string;
  maxShops: number;
  maxProducts: number;
  maxQrCodes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionSummary {
  id: string;
  userId: string;
  planId: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING_PAYMENT' | 'SUSPENDED';
  startedAt: string;
  expiredAt: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: PlanSummary;
}

export interface ShopSummary {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategorySummary {
  id: string;
  shopId: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSummary {
  id: string;
  shopId: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  imageKey: string | null;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  category?: CategorySummary;
}

export interface QrCodeSummary {
  id: string;
  shopId: string;
  name: string | null;
  url: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShopDetail extends ShopSummary {
  categories: CategorySummary[];
  products: ProductSummary[];
  qrCodes: QrCodeSummary[];
}

export interface CreateShopRequest {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  phone?: string;
  address?: string;
}

export interface UpdateShopRequest extends Partial<CreateShopRequest> {
  isActive?: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  sortOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateProductRequest {
  categoryId: string;
  name: string;
  description?: string;
  price: string;
  imageUrl?: string;
  imageKey?: string;
  sortOrder?: number;
  isAvailable?: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface UploadImageResult {
  url: string;
  key: string;
}

export interface CreateQrCodeRequest {
  name?: string;
}

export interface UpdateQrCodeRequest {
  name?: string;
  isActive?: boolean;
}

export interface CreateSubscriptionRequest {
  planId: string;
  expiredAt?: string;
}

export interface CancelSubscriptionRequest {
  cancelledAt?: string;
}

export interface AuditLogItem {
  id: string;
  userId: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  method: string;
  path: string;
  statusCode: number;
  requestId: string | null;
  ip: string | null;
  userAgent: string | null;
  metadata: unknown;
  createdAt: string;
}

export interface CreateManagedUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  level: number;
  permissions?: Permission[];
}

export interface UpdateManagedUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  level?: number;
  permissions?: Permission[];
  isActive?: boolean;
}
