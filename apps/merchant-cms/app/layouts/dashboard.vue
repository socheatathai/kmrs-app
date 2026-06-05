<script setup lang="ts">
import { routeWithShop } from '~/constants/navigation'

const route = useRoute()
const auth = useAuthStore()
const session = useSessionStore()
const shopStore = useShopStore()

const selectedShopId = computed(() => shopStore.selectedShopId || '')
const selectedShopLabel = computed(() => shopStore.selectedShop?.shopName || 'Select shop')

const visibleNavGroups = computed(() =>
  session.allowedMenus.map((group) => ({
    ...group,
    children: group.children?.map((child) => ({
      ...child,
      to: child.requiresShop ? routeWithShop(child.path, selectedShopId.value) : child.path
    }))
  }))
)

const pageTitle = computed(() => {
  for (const group of visibleNavGroups.value) {
    if (group.path && (route.path === group.path || route.path.startsWith(`${group.path}/`))) {
      return group.label
    }

    const activeChild = group.children?.find((child) => route.path === child.to || route.path.startsWith(`${child.to}/`))
    if (activeChild) {
      return activeChild.label
    }
  }

  return session.mode === 'admin' ? 'Admin' : 'Merchant'
})

const handleLogout = async () => {
  await auth.logout()
  return navigateTo('/login')
}

const handleShopChange = (event: Event) => {
  const shopId = (event.target as HTMLSelectElement).value
  shopStore.setSelectedShop(shopId)
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="brand-lockup">
          <div class="brand-mark">K</div>
          <div>
            <div class="brand-name">KMRS</div>
            <div class="brand-sub">{{ session.mode === 'admin' ? 'Platform Admin' : 'Merchant Workspace' }}</div>
          </div>
        </div>
        <span class="sidebar-toggle">⌄</span>
      </div>

      <div class="sidebar-search">
        <span>⌕</span>
        <input type="search" placeholder="Search..." />
        <kbd>CTRL</kbd>
      </div>

      <nav class="nav">
        <div v-for="group in visibleNavGroups" :key="group.key" class="nav-group">
          <NuxtLink
            v-if="group.path"
            :to="group.path"
            class="nav-link"
            :class="{ active: route.path === group.path || route.path.startsWith(`${group.path}/`) }"
          >
            <span class="nav-icon">{{ group.icon }}</span>
            {{ group.label }}
          </NuxtLink>

          <div v-else class="nav-section">
            <div class="nav-section-label">
              <span class="nav-icon">{{ group.icon }}</span>
              {{ group.label }}
            </div>
            <div class="nav-section-items">
              <NuxtLink
                v-for="child in group.children"
                :key="child.to"
                :to="child.to"
                class="nav-link sub"
                :class="{ active: route.path === child.to || route.path.startsWith(`${child.to}/`) }"
              >
                <span class="nav-icon">{{ child.icon }}</span>
                {{ child.label }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div v-if="session.mode === 'merchant' && session.accessibleShops.length > 0" class="shop-switcher">
          <label class="field-label" for="shop-select">Selected shop</label>
          <select id="shop-select" :value="selectedShopId" @change="handleShopChange">
            <option v-for="shop in session.accessibleShops" :key="shop.shopId" :value="shop.shopId">
              {{ shop.shopName }}
            </option>
          </select>
        </div>

        <div class="user-chip">
          <div class="avatar">{{ session.displayName.slice(0, 2).toUpperCase() }}</div>
          <div>
            <div class="user-name">{{ session.displayName }}</div>
            <div class="user-role">{{ session.roleLabel }}</div>
          </div>
        </div>
        <button class="btn ghost" type="button" @click="handleLogout">
          Sign out
        </button>
      </div>
    </aside>

    <div class="main">
      <header class="topbar">
        <div class="topbar-title">
          <span class="topbar-icon">▣</span>
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
      </header>

      <div class="mode-tabs">
        <span class="mode-tab active">{{ session.mode === 'admin' ? 'General' : 'Workspace' }}</span>
        <span class="mode-tab">Members</span>
        <span class="mode-tab">Notifications</span>
        <span class="mode-tab">Security</span>
        <span v-if="session.mode === 'merchant'" class="mode-tab-meta">{{ selectedShopLabel }}</span>
        <div class="mode-doc">Documentation ↗</div>
      </div>

      <main class="content">
        <div class="content-inner">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
