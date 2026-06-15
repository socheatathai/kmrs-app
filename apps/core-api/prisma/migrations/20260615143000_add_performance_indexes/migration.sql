CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");
CREATE INDEX "Subscription_userId_status_createdAt_idx" ON "Subscription"("userId", "status", "createdAt");

CREATE INDEX "Shop_ownerId_idx" ON "Shop"("ownerId");
CREATE INDEX "Shop_isActive_idx" ON "Shop"("isActive");
CREATE INDEX "Shop_createdAt_idx" ON "Shop"("createdAt");

CREATE INDEX "Category_shopId_idx" ON "Category"("shopId");
CREATE INDEX "Category_shopId_sortOrder_idx" ON "Category"("shopId", "sortOrder");
CREATE INDEX "Category_shopId_isActive_idx" ON "Category"("shopId", "isActive");

CREATE INDEX "Product_shopId_idx" ON "Product"("shopId");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_shopId_sortOrder_idx" ON "Product"("shopId", "sortOrder");
CREATE INDEX "Product_shopId_isAvailable_idx" ON "Product"("shopId", "isAvailable");

CREATE INDEX "QrCode_shopId_idx" ON "QrCode"("shopId");
CREATE INDEX "QrCode_shopId_isActive_idx" ON "QrCode"("shopId", "isActive");
CREATE INDEX "QrCode_shopId_createdAt_idx" ON "QrCode"("shopId", "createdAt");

CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");
CREATE INDEX "AuditLog_entity_createdAt_idx" ON "AuditLog"("entity", "createdAt");
