import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  AuditLogItem,
  AuthResponse,
  AuthUserProfile,
  CancelSubscriptionRequest,
  CategorySummary,
  CreateManagedUserRequest,
  CreateCategoryRequest,
  CreateProductRequest,
  CreateQrCodeRequest,
  CreateShopRequest,
  CreateSubscriptionRequest,
  LoginRequest,
  PlanSummary,
  ProductSummary,
  QrCodeSummary,
  RefreshTokenRequest,
  RegisterRequest,
  ShopDetail,
  ShopSummary,
  SubscriptionSummary,
  ManagedUserSummary,
  UpdateManagedUserRequest,
  UpdateCategoryRequest,
  UpdateProductRequest,
  UpdateQrCodeRequest,
  UpdateShopRequest,
  UploadImageResult,
} from '@kmrs-app/types';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  getAccessToken?: () => string | null | undefined;
  headers?: Record<string, string>;
}

export class ApiClientError extends Error {
  statusCode: number;
  code: string;
  details?: string | string[];

  constructor(payload: { statusCode: number; code: string; message: string | string[] }) {
    const message = Array.isArray(payload.message)
      ? payload.message.join(', ')
      : payload.message;

    super(message);
    this.name = 'ApiClientError';
    this.statusCode = payload.statusCode;
    this.code = payload.code;
    this.details = payload.message;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class ApiClient {
  private readonly baseURL: string;
  private readonly timeout: number;
  private readonly defaultHeaders: Record<string, string>;
  private readonly getAccessToken?: () => string | null | undefined;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL.replace(/\/+$/, '');
    this.timeout = config.timeout ?? 30_000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
    this.getAccessToken = config.getAccessToken;
  }

  async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: unknown,
    init?: RequestInit,
  ): Promise<T> {
    const headers = new Headers(this.defaultHeaders);
    const token = this.getAccessToken?.();
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (isFormData) {
      headers.delete('Content-Type');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...init,
      method,
      headers,
      signal: AbortSignal.timeout(this.timeout),
      body: data === undefined ? undefined : isFormData ? data : JSON.stringify(data),
    });

    const payload = (await response.json()) as
      | ApiSuccessResponse<T>
      | ApiErrorResponse;

    if (!response.ok || !payload.success) {
      const error = (payload as ApiErrorResponse).error ?? {
        statusCode: response.status,
        code: response.statusText || 'Error',
        message: 'Request failed',
      };

      throw new ApiClientError(error);
    }

    return payload.data;
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }

  postForm<T>(endpoint: string, data: FormData): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }

  patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>('PATCH', endpoint, data);
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }

  login(payload: LoginRequest) {
    return this.post<AuthResponse>('/auth/login', payload);
  }

  register(payload: RegisterRequest) {
    return this.post<AuthResponse>('/auth/register', payload);
  }

  refresh(payload: RefreshTokenRequest) {
    return this.post<AuthResponse>('/auth/refresh', payload);
  }

  getMe() {
    return this.get<AuthUserProfile>('/auth/me');
  }

  logout() {
    return this.post<{ message: string }>('/auth/logout', {});
  }

  getPlans() {
    return this.get<PlanSummary[]>('/plans');
  }

  getMySubscriptions() {
    return this.get<SubscriptionSummary[]>('/subscriptions/me');
  }

  getCurrentSubscription() {
    return this.get<SubscriptionSummary>('/subscriptions/current');
  }

  createSubscription(payload: CreateSubscriptionRequest) {
    return this.post<SubscriptionSummary>('/subscriptions', payload);
  }

  cancelSubscription(subscriptionId: string, payload: CancelSubscriptionRequest) {
    return this.patch<SubscriptionSummary>(`/subscriptions/${subscriptionId}/cancel`, payload);
  }

  getShops() {
    return this.get<ShopSummary[]>('/shops');
  }

  getShop(shopId: string) {
    return this.get<ShopDetail>(`/shops/${shopId}`);
  }

  createShop(payload: CreateShopRequest) {
    return this.post<ShopSummary>('/shops', payload);
  }

  updateShop(shopId: string, payload: UpdateShopRequest) {
    return this.patch<ShopSummary>(`/shops/${shopId}`, payload);
  }

  archiveShop(shopId: string) {
    return this.delete<ShopSummary>(`/shops/${shopId}`);
  }

  getCategories(shopId: string) {
    return this.get<CategorySummary[]>(`/shops/${shopId}/categories`);
  }

  createCategory(shopId: string, payload: CreateCategoryRequest) {
    return this.post<CategorySummary>(`/shops/${shopId}/categories`, payload);
  }

  updateCategory(shopId: string, categoryId: string, payload: UpdateCategoryRequest) {
    return this.patch<CategorySummary>(`/shops/${shopId}/categories/${categoryId}`, payload);
  }

  deleteCategory(shopId: string, categoryId: string) {
    return this.delete<CategorySummary>(`/shops/${shopId}/categories/${categoryId}`);
  }

  getProducts(shopId: string) {
    return this.get<ProductSummary[]>(`/shops/${shopId}/products`);
  }

  createProduct(shopId: string, payload: CreateProductRequest) {
    return this.post<ProductSummary>(`/shops/${shopId}/products`, payload);
  }

  updateProduct(shopId: string, productId: string, payload: UpdateProductRequest) {
    return this.patch<ProductSummary>(`/shops/${shopId}/products/${productId}`, payload);
  }

  deleteProduct(shopId: string, productId: string) {
    return this.delete<ProductSummary>(`/shops/${shopId}/products/${productId}`);
  }

  uploadImage(file: File | Blob, folder: 'prod' | 'uat' = 'prod') {
    const formData = new FormData();
    formData.append('file', file);

    return this.postForm<UploadImageResult>(`/uploads/images?folder=${folder}`, formData);
  }

  getQrCodes(shopId: string) {
    return this.get<QrCodeSummary[]>(`/shops/${shopId}/qrcodes`);
  }

  createQrCode(shopId: string, payload: CreateQrCodeRequest) {
    return this.post<QrCodeSummary>(`/shops/${shopId}/qrcodes`, payload);
  }

  updateQrCode(shopId: string, qrCodeId: string, payload: UpdateQrCodeRequest) {
    return this.patch<QrCodeSummary>(`/shops/${shopId}/qrcodes/${qrCodeId}`, payload);
  }

  deleteQrCode(shopId: string, qrCodeId: string) {
    return this.delete<QrCodeSummary>(`/shops/${shopId}/qrcodes/${qrCodeId}`);
  }

  getUsers() {
    return this.get<ManagedUserSummary[]>('/users');
  }

  getUser(userId: string) {
    return this.get<ManagedUserSummary>(`/users/${userId}`);
  }

  createUser(payload: CreateManagedUserRequest) {
    return this.post<ManagedUserSummary>('/users', payload);
  }

  updateUser(userId: string, payload: UpdateManagedUserRequest) {
    return this.patch<ManagedUserSummary>(`/users/${userId}`, payload);
  }

  deleteUser(userId: string) {
    return this.delete<ManagedUserSummary>(`/users/${userId}`);
  }

  getAuditLogs(params?: { action?: string; entity?: string; userId?: string }) {
    const search = new URLSearchParams();

    if (params?.action) {
      search.set('action', params.action);
    }

    if (params?.entity) {
      search.set('entity', params.entity);
    }

    if (params?.userId) {
      search.set('userId', params.userId);
    }

    const query = search.toString();
    return this.get<AuditLogItem[]>(`/audit-logs${query ? `?${query}` : ''}`);
  }
}

export function createApiClient(config: ApiClientConfig) {
  return new ApiClient(config);
}
