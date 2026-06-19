<script setup lang="ts">
import { NAV_ITEMS } from '~/constants/navigation'
import type { ShopDetail } from '@kmrs-app/types'

const route = useRoute()
const config = useRuntimeConfig()
const client = useApiClient()
const auth = useAuthStore()
const session = useSessionStore()
const shop = useShopStore()
const drawerOpen = ref(false)
const currentYear = new Date().getFullYear()
const avatarFailed = ref(false)
const selectedShopDetail = ref<ShopDetail | null>(null)
let selectedShopRequest = 0

const storefrontHref = computed(() => {
  if (session.mode !== 'merchant' || !selectedShopDetail.value?.slug) {
    return ''
  }

  const baseUrl = config.public.customerWebBase.replace(/\/+$/, '')
  return `${baseUrl}/${encodeURIComponent(selectedShopDetail.value.slug)}`
})

watch(
  () => shop.selectedShopId,
  async (shopId) => {
    const requestId = ++selectedShopRequest
    selectedShopDetail.value = null

    if (session.mode !== 'merchant' || !shopId) {
      return
    }

    try {
      const detail = await client.getShop(shopId)

      if (requestId === selectedShopRequest) {
        selectedShopDetail.value = detail
      }
    } catch {
      if (requestId === selectedShopRequest) {
        selectedShopDetail.value = null
      }
    }
  },
  { immediate: true }
)

const links = computed(() =>
  NAV_ITEMS.filter((item) =>
    (item.mode === 'all' || item.mode === session.mode) && session.can(item.permission)
  )
)

const shopMenuLinks = computed(() => {
  const shopId = shop.selectedShopId

  if (session.mode !== 'merchant' || !shopId) {
    return []
  }

  return [
    { label: 'Description', to: `/shops/${shopId}/description`, icon: 'i-lucide-file-text', mode: 'merchant' as const, permission: 'shop.settings.view' as const },
    { label: 'Catalog', to: `/shops/${shopId}/catalog`, icon: 'i-lucide-list', mode: 'merchant' as const, permission: 'shop.view' as const },
    { label: 'QR Codes', to: `/shops/${shopId}/qrcodes`, icon: 'i-lucide-qr-code', mode: 'merchant' as const, permission: 'qrcode.view' as const }
  ].filter((item) => session.can(item.permission))
})

const merchantLinks = computed(() => {
  if (session.mode !== 'merchant') {
    return links.value.filter((item) => item.to !== '/dashboard')
  }

  return links.value
    .filter((item) => item.to !== '/dashboard')
    .flatMap((item) => item.to === '/shops' ? [item, ...shopMenuLinks.value] : [item])
})

const navGroups = computed(() => [
  {
    label: 'Workspace',
    items: links.value.filter((item) => item.to === '/dashboard')
  },
  {
    label: session.mode === 'admin' ? 'Operations' : 'Merchant',
    items: merchantLinks.value
  }
].filter((group) => group.items.length))

const isActive = (path: string) => {
  if (path === '/shops') {
    return route.path === '/shops'
  }

  if (path.endsWith('/catalog')) {
    return route.path === path || route.path.startsWith(path) || route.path.startsWith(path.replace('/catalog', '/products'))
  }

  return route.path === path || route.path.startsWith(`${path}/`)
}
const title = computed(() =>
  navGroups.value.flatMap((group) => group.items).find((item) => isActive(item.to))?.label ?? 'Dashboard'
)
useHead({
  title
})
const isGroupActive = (items: typeof links.value) => items.some((item) => isActive(item.to))
const openGroups = reactive<Record<string, boolean>>({})

watch(
  navGroups,
  (groups) => {
    for (const group of groups) {
      openGroups[group.label] ??= isGroupActive(group.items)

      if (isGroupActive(group.items)) {
        openGroups[group.label] = true
      }
    }
  },
  { immediate: true }
)

const setGroupOpen = (label: string, event: Event) => {
  openGroups[label] = (event.target as HTMLDetailsElement).open
}

const handleLogout = async () => {
  drawerOpen.value = false
  await auth.logout()
  return navigateTo('/login')
}

watch(() => session.profileUrl, () => {
  avatarFailed.value = false
})
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="sidebar-head">
        <div class="brand">
          <img class="brand-mark" src="/logo.png" alt="KMRS App">
          <div>
            <div class="brand-title">KMRS App</div>
            <div class="brand-sub">{{ session.mode === 'admin' ? 'Admin Console' : 'Merchant CMS' }}</div>
          </div>
        </div>
      </div>

      <nav class="nav" aria-label="Main navigation">
        <details
          v-for="group in navGroups"
          :key="group.label"
          class="nav-section"
          :open="openGroups[group.label]"
          @toggle="setGroupOpen(group.label, $event)"
        >
          <summary class="nav-section-toggle">
            <span>{{ group.label }}</span>
            <span class="nav-chevron" aria-hidden="true" />
          </summary>
          <div class="nav-section-items">
            <NuxtLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              class="nav-link"
              :class="{ active: isActive(item.to) }"
            >
              <span class="nav-icon" :class="item.icon" aria-hidden="true" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </div>
        </details>
      </nav>

      <div class="user-box">
        <div class="user-chip">
          <div class="avatar">
            <img
              v-if="session.profileUrl && !avatarFailed"
              :src="session.profileUrl"
              :alt="session.displayName"
              referrerpolicy="no-referrer"
              @error="avatarFailed = true"
            >
            <span v-else>{{ session.initials }}</span>
          </div>
          <div>
            <div class="user-name">{{ session.displayName }}</div>
            <div class="user-role">{{ session.username }}</div>
          </div>
        </div>
        <button class="button ghost" type="button" @click="handleLogout">Sign out</button>
      </div>
    </aside>

    <div class="workspace">
      <header class="topbar">
        <button class="icon-button menu-button" type="button" aria-label="Open navigation" @click="drawerOpen = true">
          <span class="hamburger" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span class="menu-label">Menu</span>
        </button>
        <div>
          <div class="page-title">{{ title }}</div>
          <div class="page-subtitle">{{ session.mode === 'admin' ? 'Platform operations' : shop.selectedShop?.shopName || 'Merchant workspace' }}</div>
        </div>
        <a
          v-if="storefrontHref"
          class="button storefront-button"
          :href="storefrontHref"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="`View ${shop.selectedShop?.shopName || 'store'} customer menu`"
        >
          <span class="storefront-button-label">View Store</span>
          <span class="i-lucide-external-link storefront-button-icon" aria-hidden="true" />
        </a>
      </header>

      <main class="content">
        <slot />
      </main>

      <footer class="app-footer">
        <span>KMRS App Merchant Dashboard</span>
        <span>{{ currentYear }}</span>
      </footer>
    </div>

    <Teleport to="body">
      <div v-if="drawerOpen" class="drawer-wrap">
        <button class="drawer-backdrop" type="button" aria-label="Close navigation" @click="drawerOpen = false" />
        <aside class="drawer">
          <div class="drawer-head">
            <div class="brand">
              <img class="brand-mark" src="/logo.png" alt="KMRS App">
              <div>
                <div class="brand-title">KMRS App</div>
                <div class="brand-sub">{{ session.mode === 'admin' ? 'Admin Console' : 'Merchant CMS' }}</div>
              </div>
            </div>
            <button class="icon-button" type="button" aria-label="Close navigation" @click="drawerOpen = false">
              <span class="close-symbol" aria-hidden="true">X</span>
            </button>
          </div>

          <nav class="nav" aria-label="Mobile navigation">
            <details
              v-for="group in navGroups"
              :key="group.label"
              class="nav-section"
              :open="openGroups[group.label]"
              @toggle="setGroupOpen(group.label, $event)"
            >
              <summary class="nav-section-toggle">
                <span>{{ group.label }}</span>
                <span class="nav-chevron" aria-hidden="true" />
              </summary>
              <div class="nav-section-items">
                <template v-for="item in group.items" :key="item.to">
                  <NuxtLink
                    :to="item.to"
                    class="nav-link"
                    :class="{ active: isActive(item.to) }"
                    @click="drawerOpen = false"
                  >
                    <span class="nav-icon" :class="item.icon" aria-hidden="true" />
                    <span>{{ item.label }}</span>
                  </NuxtLink>
                </template>
              </div>
            </details>
          </nav>

          <div class="user-box">
            <div class="user-chip">
              <div class="avatar">
                <img
                  v-if="session.profileUrl && !avatarFailed"
                  :src="session.profileUrl"
                  :alt="session.displayName"
                  referrerpolicy="no-referrer"
                  @error="avatarFailed = true"
                >
                <span v-else>{{ session.initials }}</span>
              </div>
              <div>
                <div class="user-name">{{ session.displayName }}</div>
                <div class="user-role">{{ session.username }}</div>
              </div>
            </div>
            <button class="button ghost" type="button" @click="handleLogout">Sign out</button>
          </div>
        </aside>
      </div>
    </Teleport>
  </div>
</template>
