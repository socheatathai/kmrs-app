import { config as loadEnv } from 'dotenv';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, ShopMemberRole, SubscriptionStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import pg from 'pg';

const isProduction = process.env.NODE_ENV === 'production';
const envFilePath = isProduction ? '.env.production' : '.env.local';

loadEnv({ path: envFilePath });

const PERMISSIONS = {
  dashboardView: 'dashboard.view',
  accountView: 'account.view',
  accountCreate: 'account.create',
  accountUpdate: 'account.update',
  accountDelete: 'account.delete',
  shopView: 'shop.view',
  shopCreate: 'shop.create',
  shopUpdate: 'shop.update',
  shopDelete: 'shop.delete',
  shopSettingsView: 'shop.settings.view',
  shopSettingsUpdate: 'shop.settings.update',
  categoryView: 'category.view',
  categoryCreate: 'category.create',
  categoryUpdate: 'category.update',
  categoryDelete: 'category.delete',
  productView: 'product.view',
  productCreate: 'product.create',
  productUpdate: 'product.update',
  productDelete: 'product.delete',
  qrCodeView: 'qrcode.view',
  qrCodeCreate: 'qrcode.create',
  qrCodeUpdate: 'qrcode.update',
  qrCodeDelete: 'qrcode.delete',
  subscriptionView: 'subscription.view',
  settingsView: 'settings.view',
  settingsUpdate: 'settings.update',
  menuView: 'menu.view',
  menuUpdate: 'menu.update',
} as const;

const allPermissions = Object.values(PERMISSIONS);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const plans = [
    {
      name: 'Free',
      price: '0.00',
      maxShops: 1,
      maxProducts: 20,
      maxQrCodes: 1,
    },
    {
      name: 'Starter',
      price: '4.99',
      maxShops: 3,
      maxProducts: 100,
      maxQrCodes: 5,
    },
    {
      name: 'Pro',
      price: '9.99',
      maxShops: 10,
      maxProducts: 500,
      maxQrCodes: 20,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }

  const starterPlan = await prisma.plan.findUnique({
    where: { name: 'Starter' },
  });
  const proPlan = await prisma.plan.findUnique({
    where: { name: 'Pro' },
  });

  if (!starterPlan || !proPlan) {
    throw new Error('Required plans are missing for seed setup');
  }

  const password = await bcrypt.hash('secret123', 10);

  const merchant = await prisma.user.upsert({
    where: { email: 'nika@example.com' },
    update: {
      name: 'Nika Demo',
      password,
      profileUrl: 'https://picsum.photos/id/64/240/240',
      role: UserRole.MERCHANT_OWNER,
      level: 2,
      permissions: [
        PERMISSIONS.dashboardView,
        PERMISSIONS.accountView,
        PERMISSIONS.accountCreate,
        PERMISSIONS.accountUpdate,
        PERMISSIONS.shopView,
        PERMISSIONS.shopCreate,
        PERMISSIONS.shopUpdate,
        PERMISSIONS.shopSettingsView,
        PERMISSIONS.shopSettingsUpdate,
        PERMISSIONS.categoryView,
        PERMISSIONS.categoryCreate,
        PERMISSIONS.categoryUpdate,
        PERMISSIONS.categoryDelete,
        PERMISSIONS.productView,
        PERMISSIONS.productCreate,
        PERMISSIONS.productUpdate,
        PERMISSIONS.productDelete,
        PERMISSIONS.qrCodeView,
        PERMISSIONS.qrCodeCreate,
        PERMISSIONS.qrCodeUpdate,
        PERMISSIONS.qrCodeDelete,
        PERMISSIONS.subscriptionView,
        PERMISSIONS.settingsView,
        PERMISSIONS.settingsUpdate,
        PERMISSIONS.menuView,
        PERMISSIONS.menuUpdate,
      ],
    },
    create: {
      name: 'Nika Demo',
      email: 'nika@example.com',
      password,
      profileUrl: 'https://picsum.photos/id/64/240/240',
      role: UserRole.MERCHANT_OWNER,
      level: 2,
      permissions: [
        PERMISSIONS.dashboardView,
        PERMISSIONS.accountView,
        PERMISSIONS.accountCreate,
        PERMISSIONS.accountUpdate,
        PERMISSIONS.shopView,
        PERMISSIONS.shopCreate,
        PERMISSIONS.shopUpdate,
        PERMISSIONS.shopSettingsView,
        PERMISSIONS.shopSettingsUpdate,
        PERMISSIONS.categoryView,
        PERMISSIONS.categoryCreate,
        PERMISSIONS.categoryUpdate,
        PERMISSIONS.categoryDelete,
        PERMISSIONS.productView,
        PERMISSIONS.productCreate,
        PERMISSIONS.productUpdate,
        PERMISSIONS.productDelete,
        PERMISSIONS.qrCodeView,
        PERMISSIONS.qrCodeCreate,
        PERMISSIONS.qrCodeUpdate,
        PERMISSIONS.qrCodeDelete,
        PERMISSIONS.subscriptionView,
        PERMISSIONS.settingsView,
        PERMISSIONS.settingsUpdate,
        PERMISSIONS.menuView,
        PERMISSIONS.menuUpdate,
      ],
    },
  });

  const secondMerchant = await prisma.user.upsert({
    where: { email: 'bistro@example.com' },
    update: {
      name: 'Bistro Demo',
      password,
      profileUrl: 'https://picsum.photos/id/65/240/240',
      role: UserRole.MERCHANT_OWNER,
      level: 2,
      permissions: [
        PERMISSIONS.dashboardView,
        PERMISSIONS.accountView,
        PERMISSIONS.accountCreate,
        PERMISSIONS.accountUpdate,
        PERMISSIONS.shopView,
        PERMISSIONS.shopCreate,
        PERMISSIONS.shopUpdate,
        PERMISSIONS.shopSettingsView,
        PERMISSIONS.shopSettingsUpdate,
        PERMISSIONS.categoryView,
        PERMISSIONS.categoryCreate,
        PERMISSIONS.categoryUpdate,
        PERMISSIONS.categoryDelete,
        PERMISSIONS.productView,
        PERMISSIONS.productCreate,
        PERMISSIONS.productUpdate,
        PERMISSIONS.productDelete,
        PERMISSIONS.qrCodeView,
        PERMISSIONS.qrCodeCreate,
        PERMISSIONS.qrCodeUpdate,
        PERMISSIONS.qrCodeDelete,
        PERMISSIONS.subscriptionView,
        PERMISSIONS.settingsView,
        PERMISSIONS.settingsUpdate,
        PERMISSIONS.menuView,
        PERMISSIONS.menuUpdate,
      ],
    },
    create: {
      name: 'Bistro Demo',
      email: 'bistro@example.com',
      password,
      profileUrl: 'https://picsum.photos/id/65/240/240',
      role: UserRole.MERCHANT_OWNER,
      level: 2,
      permissions: [
        PERMISSIONS.dashboardView,
        PERMISSIONS.accountView,
        PERMISSIONS.accountCreate,
        PERMISSIONS.accountUpdate,
        PERMISSIONS.shopView,
        PERMISSIONS.shopCreate,
        PERMISSIONS.shopUpdate,
        PERMISSIONS.shopSettingsView,
        PERMISSIONS.shopSettingsUpdate,
        PERMISSIONS.categoryView,
        PERMISSIONS.categoryCreate,
        PERMISSIONS.categoryUpdate,
        PERMISSIONS.categoryDelete,
        PERMISSIONS.productView,
        PERMISSIONS.productCreate,
        PERMISSIONS.productUpdate,
        PERMISSIONS.productDelete,
        PERMISSIONS.qrCodeView,
        PERMISSIONS.qrCodeCreate,
        PERMISSIONS.qrCodeUpdate,
        PERMISSIONS.qrCodeDelete,
        PERMISSIONS.subscriptionView,
        PERMISSIONS.settingsView,
        PERMISSIONS.settingsUpdate,
        PERMISSIONS.menuView,
        PERMISSIONS.menuUpdate,
      ],
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      name: 'Admin Demo',
      password,
      profileUrl: 'https://picsum.photos/id/1005/240/240',
      role: UserRole.SUPER_ADMIN,
      level: 1,
      permissions: allPermissions,
    },
    create: {
      name: 'Admin Demo',
      email: 'admin@example.com',
      password,
      profileUrl: 'https://picsum.photos/id/1005/240/240',
      role: UserRole.SUPER_ADMIN,
      level: 1,
      permissions: allPermissions,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: {
      name: 'Staff Demo',
      password,
      profileUrl: 'https://picsum.photos/id/1011/240/240',
      role: UserRole.STAFF,
      level: 3,
      permissions: [
        PERMISSIONS.dashboardView,
        PERMISSIONS.shopView,
        PERMISSIONS.categoryView,
        PERMISSIONS.productView,
        PERMISSIONS.qrCodeView,
        PERMISSIONS.menuView,
      ],
      managedById: merchant.id,
    },
    create: {
      name: 'Staff Demo',
      email: 'staff@example.com',
      password,
      profileUrl: 'https://picsum.photos/id/1011/240/240',
      role: UserRole.STAFF,
      level: 3,
      permissions: [
        PERMISSIONS.dashboardView,
        PERMISSIONS.shopView,
        PERMISSIONS.categoryView,
        PERMISSIONS.productView,
        PERMISSIONS.qrCodeView,
        PERMISSIONS.menuView,
      ],
      managedById: merchant.id,
    },
  });

  await prisma.subscription.upsert({
    where: { id: '0e4eb8be-d048-47e5-a5b3-bc4ee5406c1b' },
    update: {
      userId: merchant.id,
      planId: starterPlan.id,
      status: SubscriptionStatus.ACTIVE,
      expiredAt: new Date('2027-12-31T23:59:59.000Z'),
    },
    create: {
      id: '0e4eb8be-d048-47e5-a5b3-bc4ee5406c1b',
      userId: merchant.id,
      planId: starterPlan.id,
      status: SubscriptionStatus.ACTIVE,
      expiredAt: new Date('2027-12-31T23:59:59.000Z'),
    },
  });

  await prisma.subscription.upsert({
    where: { id: '154cbca3-746f-49dd-bd09-e320565bbc42' },
    update: {
      userId: secondMerchant.id,
      planId: proPlan.id,
      status: SubscriptionStatus.ACTIVE,
      expiredAt: new Date('2027-12-31T23:59:59.000Z'),
    },
    create: {
      id: '154cbca3-746f-49dd-bd09-e320565bbc42',
      userId: secondMerchant.id,
      planId: proPlan.id,
      status: SubscriptionStatus.ACTIVE,
      expiredAt: new Date('2027-12-31T23:59:59.000Z'),
    },
  });

  await prisma.subscription.upsert({
    where: { id: 'b5cb1060-d226-4727-a7a9-cb80d91c03f8' },
    update: {
      userId: secondMerchant.id,
      planId: starterPlan.id,
      status: SubscriptionStatus.CANCELLED,
      expiredAt: new Date('2026-12-31T23:59:59.000Z'),
    },
    create: {
      id: 'b5cb1060-d226-4727-a7a9-cb80d91c03f8',
      userId: secondMerchant.id,
      planId: starterPlan.id,
      status: SubscriptionStatus.CANCELLED,
      expiredAt: new Date('2026-12-31T23:59:59.000Z'),
    },
  });

  const sunriseCafe = await prisma.shop.upsert({
    where: { slug: 'sunrise-cafe' },
    update: {
      ownerId: merchant.id,
      name: 'Sunrise Cafe',
      description: 'Coffee, brunch, and bakery menu for demo data.',
      logoUrl: 'https://picsum.photos/id/1062/300/300',
      coverUrl: 'https://picsum.photos/id/1035/1200/400',
      phone: '+85512345678',
      address: 'Phnom Penh, Cambodia',
      isActive: true,
    },
    create: {
      ownerId: merchant.id,
      name: 'Sunrise Cafe',
      slug: 'sunrise-cafe',
      description: 'Coffee, brunch, and bakery menu for demo data.',
      logoUrl: 'https://picsum.photos/id/1062/300/300',
      coverUrl: 'https://picsum.photos/id/1035/1200/400',
      phone: '+85512345678',
      address: 'Phnom Penh, Cambodia',
      isActive: true,
    },
  });

  const moonlightBistro = await prisma.shop.upsert({
    where: { slug: 'moonlight-bistro' },
    update: {
      ownerId: secondMerchant.id,
      name: 'Moonlight Bistro',
      description: 'Modern Khmer comfort food and evening drinks.',
      logoUrl: 'https://picsum.photos/id/292/300/300',
      coverUrl: 'https://picsum.photos/id/1040/1200/400',
      phone: '+85598765432',
      address: 'Siem Reap, Cambodia',
      isActive: true,
    },
    create: {
      ownerId: secondMerchant.id,
      name: 'Moonlight Bistro',
      slug: 'moonlight-bistro',
      description: 'Modern Khmer comfort food and evening drinks.',
      logoUrl: 'https://picsum.photos/id/292/300/300',
      coverUrl: 'https://picsum.photos/id/1040/1200/400',
      phone: '+85598765432',
      address: 'Siem Reap, Cambodia',
      isActive: true,
    },
  });

  await prisma.shopMember.upsert({
    where: {
      shopId_userId: {
        shopId: sunriseCafe.id,
        userId: staff.id,
      },
    },
    update: {
      role: ShopMemberRole.STAFF,
      isActive: true,
      permissions: [
        PERMISSIONS.dashboardView,
        PERMISSIONS.shopView,
        PERMISSIONS.shopSettingsView,
        PERMISSIONS.categoryView,
        PERMISSIONS.categoryCreate,
        PERMISSIONS.categoryUpdate,
        PERMISSIONS.productView,
        PERMISSIONS.productCreate,
        PERMISSIONS.productUpdate,
        PERMISSIONS.qrCodeView,
        PERMISSIONS.menuView,
        PERMISSIONS.menuUpdate,
      ],
    },
    create: {
      shopId: sunriseCafe.id,
      userId: staff.id,
      role: ShopMemberRole.STAFF,
      isActive: true,
      permissions: [
        PERMISSIONS.dashboardView,
        PERMISSIONS.shopView,
        PERMISSIONS.shopSettingsView,
        PERMISSIONS.categoryView,
        PERMISSIONS.categoryCreate,
        PERMISSIONS.categoryUpdate,
        PERMISSIONS.productView,
        PERMISSIONS.productCreate,
        PERMISSIONS.productUpdate,
        PERMISSIONS.qrCodeView,
        PERMISSIONS.menuView,
        PERMISSIONS.menuUpdate,
      ],
    },
  });

  const coffeeCategory = await prisma.category.upsert({
    where: { id: '75eb928d-7c25-4fb0-854d-11d90ee72580' },
    update: {
      shopId: sunriseCafe.id,
      name: 'Coffee',
      sortOrder: 1,
      isActive: true,
    },
    create: {
      id: '75eb928d-7c25-4fb0-854d-11d90ee72580',
      shopId: sunriseCafe.id,
      name: 'Coffee',
      sortOrder: 1,
      isActive: true,
    },
  });

  const brunchCategory = await prisma.category.upsert({
    where: { id: 'd30af527-50ce-4a4a-aa4d-97e0100e4f7c' },
    update: {
      shopId: sunriseCafe.id,
      name: 'Brunch',
      sortOrder: 2,
      isActive: true,
    },
    create: {
      id: 'd30af527-50ce-4a4a-aa4d-97e0100e4f7c',
      shopId: sunriseCafe.id,
      name: 'Brunch',
      sortOrder: 2,
      isActive: true,
    },
  });

  const bakeryCategory = await prisma.category.upsert({
    where: { id: '38947e95-d912-45a2-8403-d692e652f2e7' },
    update: {
      shopId: sunriseCafe.id,
      name: 'Bakery',
      sortOrder: 3,
      isActive: true,
    },
    create: {
      id: '38947e95-d912-45a2-8403-d692e652f2e7',
      shopId: sunriseCafe.id,
      name: 'Bakery',
      sortOrder: 3,
      isActive: true,
    },
  });

  const mainsCategory = await prisma.category.upsert({
    where: { id: '51711b85-a488-4ca4-bc99-fb0264280988' },
    update: {
      shopId: moonlightBistro.id,
      name: 'Mains',
      sortOrder: 1,
      isActive: true,
    },
    create: {
      id: '51711b85-a488-4ca4-bc99-fb0264280988',
      shopId: moonlightBistro.id,
      name: 'Mains',
      sortOrder: 1,
      isActive: true,
    },
  });

  const drinksCategory = await prisma.category.upsert({
    where: { id: 'ca68fbef-c4d8-4d3f-b0fd-f57deed74d66' },
    update: {
      shopId: moonlightBistro.id,
      name: 'Drinks',
      sortOrder: 2,
      isActive: true,
    },
    create: {
      id: 'ca68fbef-c4d8-4d3f-b0fd-f57deed74d66',
      shopId: moonlightBistro.id,
      name: 'Drinks',
      sortOrder: 2,
      isActive: true,
    },
  });

  const products = [
    {
      id: 'db386a55-7040-4fec-b4bd-9e7b77b05c89',
      shopId: sunriseCafe.id,
      categoryId: coffeeCategory.id,
      name: 'Americano',
      description: 'Double espresso with hot water.',
      price: '2.50',
      imageUrl: 'https://picsum.photos/id/431/600/400',
      sortOrder: 1,
      isAvailable: true,
    },
    {
      id: '7bd4b330-6c76-4281-81e4-65c1d494dcee',
      shopId: sunriseCafe.id,
      categoryId: coffeeCategory.id,
      name: 'Iced Latte',
      description: 'Espresso with milk over ice.',
      price: '3.25',
      imageUrl: 'https://picsum.photos/id/225/600/400',
      sortOrder: 2,
      isAvailable: true,
    },
    {
      id: '2720db6f-58fa-44c8-a3c7-41e5cf87b281',
      shopId: sunriseCafe.id,
      categoryId: brunchCategory.id,
      name: 'Avocado Toast',
      description: 'Sourdough, avocado, poached egg, and chili flakes.',
      price: '5.75',
      imageUrl: 'https://picsum.photos/id/1080/600/400',
      sortOrder: 1,
      isAvailable: true,
    },
    {
      id: 'ec0cf64b-9001-4d63-b637-c337e13ef4d8',
      shopId: sunriseCafe.id,
      categoryId: bakeryCategory.id,
      name: 'Butter Croissant',
      description: 'Flaky laminated pastry baked fresh every morning.',
      price: '2.20',
      imageUrl: 'https://picsum.photos/id/102/600/400',
      sortOrder: 1,
      isAvailable: true,
    },
    {
      id: '7cc80a5d-d4a0-47b8-bd11-5606827b85af',
      shopId: moonlightBistro.id,
      categoryId: mainsCategory.id,
      name: 'Beef Lok Lak',
      description: 'Stir-fried beef with pepper lime sauce and rice.',
      price: '8.50',
      imageUrl: 'https://picsum.photos/id/292/600/400',
      sortOrder: 1,
      isAvailable: true,
    },
    {
      id: '0c1b1ddd-c5d8-45cd-905d-d74daf9944a8',
      shopId: moonlightBistro.id,
      categoryId: drinksCategory.id,
      name: 'Passion Soda',
      description: 'Sparkling passion fruit cooler.',
      price: '3.75',
      imageUrl: 'https://picsum.photos/id/429/600/400',
      sortOrder: 1,
      isAvailable: true,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product,
    });
  }

  const qrCodes = [
    {
      id: '99560382-583e-4dc5-ab18-b5285147d0d4',
      shopId: sunriseCafe.id,
      name: 'Counter QR',
      url: 'https://kmrs.tech/sunrise-cafe',
      imageUrl: 'https://picsum.photos/id/237/400/400',
      isActive: true,
    },
    {
      id: 'c70d4d1d-e888-42f6-a95f-f63f7ebc90ee',
      shopId: sunriseCafe.id,
      name: 'Patio QR',
      url: 'https://kmrs.tech/sunrise-cafe',
      imageUrl: 'https://picsum.photos/id/238/400/400',
      isActive: true,
    },
    {
      id: 'eb105871-b65c-45df-af7d-660a9d4d41e2',
      shopId: moonlightBistro.id,
      name: 'Host Stand QR',
      url: 'https://kmrs.tech/moonlight-bistro',
      imageUrl: 'https://picsum.photos/id/239/400/400',
      isActive: true,
    },
  ];

  for (const qrCode of qrCodes) {
    await prisma.qrCode.upsert({
      where: { id: qrCode.id },
      update: qrCode,
      create: qrCode,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
