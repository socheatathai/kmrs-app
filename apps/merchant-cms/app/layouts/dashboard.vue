<script setup lang="ts">
import { NAV_ITEMS } from '~/constants/navigation'

const route = useRoute()
const auth = useAuthStore()
const session = useSessionStore()
const shop = useShopStore()
const drawerOpen = ref(false)
const currentYear = new Date().getFullYear()

const links = computed(() =>
  NAV_ITEMS.filter((item) =>
    (item.mode === 'all' || item.mode === session.mode) && session.can(item.permission)
  )
)

const navGroups = computed(() => [
  {
    label: 'Workspace',
    items: links.value.filter((item) => item.to === '/dashboard')
  },
  {
    label: session.mode === 'admin' ? 'Operations' : 'Merchant',
    items: links.value.filter((item) => item.to !== '/dashboard')
  }
].filter((group) => group.items.length))

const title = computed(() => links.value.find((item) => route.path === item.to || route.path.startsWith(`${item.to}/`))?.label ?? 'Dashboard')
const isActive = (path: string) => route.path === path || route.path.startsWith(`${path}/`)
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
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="sidebar-head">
        <div class="brand">
          <div class="brand-mark">K</div>
          <div>
            <div class="brand-title">KMRS</div>
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
            <img v-if="session.profileUrl" :src="session.profileUrl" :alt="session.displayName">
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
      </header>

      <main class="content">
        <slot />
      </main>

      <footer class="app-footer">
        <span>KMRS Merchant CMS</span>
        <span>{{ currentYear }}</span>
      </footer>
    </div>

    <Teleport to="body">
      <div v-if="drawerOpen" class="drawer-wrap">
        <button class="drawer-backdrop" type="button" aria-label="Close navigation" @click="drawerOpen = false" />
        <aside class="drawer">
          <div class="drawer-head">
            <div class="brand">
              <div class="brand-mark">K</div>
              <div>
                <div class="brand-title">KMRS</div>
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
                <NuxtLink
                  v-for="item in group.items"
                  :key="item.to"
                  :to="item.to"
                  class="nav-link"
                  :class="{ active: isActive(item.to) }"
                  @click="drawerOpen = false"
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
                <img v-if="session.profileUrl" :src="session.profileUrl" :alt="session.displayName">
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
