<script setup lang="ts">
import type { UpdateManagedUserRequest } from '@kmrs-app/types'
import {
  LEVEL_DEFAULT_PERMISSIONS,
  LEVEL_LABELS,
  LEVEL_ROLE_MAP,
  PERMISSION_GROUPS,
  normalizePermissions,
  permissionLabel
} from '~/constants/user-access'

const route = useRoute()
const client = useApiClient()
const session = useSessionStore()

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin', 'permission'],
  permission: 'account.update'
})

const userId = computed(() => String(route.params.userId))
const levelOptions = computed(() =>
  session.level <= 1
    ? [
        { value: 2, label: LEVEL_LABELS[2] },
        { value: 3, label: LEVEL_LABELS[3] }
      ]
    : [{ value: 3, label: LEVEL_LABELS[3] }]
)

const form = reactive<UpdateManagedUserRequest>({
  name: '',
  email: '',
  password: '',
  role: 'STAFF',
  level: 3,
  permissions: [],
  isActive: true
})

const isSubmitting = ref(false)
const isDeleting = ref(false)
const errorMessage = ref('')

const { data: user, pending, error, refresh } = await useAsyncData(
  () => `admin-user-${userId.value}`,
  () => client.getUser(userId.value),
  { watch: [userId] }
)

watch(
  user,
  (value) => {
    if (!value) {
      return
    }

    form.name = value.name
    form.email = value.email
    form.password = ''
    form.role = value.role
    form.level = value.level
    form.permissions = [...value.permissions]
    form.isActive = value.isActive
  },
  { immediate: true }
)

const applyLevelDefaults = () => {
  const level = form.level ?? 3
  form.role = LEVEL_ROLE_MAP[level] ?? 'STAFF'
  form.permissions = [...(LEVEL_DEFAULT_PERMISSIONS[level] ?? LEVEL_DEFAULT_PERMISSIONS[3] ?? [])]
}

const togglePermission = (permission: string) => {
  if (form.permissions?.includes(permission)) {
    form.permissions = form.permissions.filter((item) => item !== permission)
    return
  }

  form.permissions = normalizePermissions([...(form.permissions ?? []), permission])
}

const submit = async () => {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const payload: UpdateManagedUserRequest = {
      name: form.name,
      email: form.email,
      role: LEVEL_ROLE_MAP[form.level ?? 3] ?? 'STAFF',
      level: form.level,
      permissions: normalizePermissions(form.permissions ?? []),
      isActive: form.isActive
    }

    if (form.password) {
      payload.password = form.password
    }

    await client.updateUser(userId.value, payload)
    await refresh()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to update account.'
  } finally {
    isSubmitting.value = false
  }
}

const removeUser = async () => {
  if (!window.confirm('Delete this account? This action cannot be undone.')) {
    return
  }

  errorMessage.value = ''
  isDeleting.value = true

  try {
    await client.deleteUser(userId.value)
    await navigateTo('/admin/accounts')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to delete account.'
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <section class="panel page-stack">
    <div class="panel-header">
      <div>
        <h3>Edit Account</h3>
        <p class="muted">Update access, status, and credentials for this managed account.</p>
      </div>
      <div class="inline-actions">
        <button class="btn ghost" type="button" @click="() => refresh()">Refresh</button>
        <NuxtLink class="btn ghost" to="/admin/accounts">Back to accounts</NuxtLink>
      </div>
    </div>

    <div v-if="pending" class="state-card">
      Loading account...
    </div>
    <div v-else-if="error" class="state-card error">
      Unable to load this account.
    </div>
    <form v-else class="form page-stack" @submit.prevent="submit">
      <div class="form-grid two">
        <label class="field">
          <span class="field-label">Name</span>
          <input v-model.trim="form.name" required maxlength="120" />
        </label>

        <label class="field">
          <span class="field-label">Email</span>
          <input v-model.trim="form.email" required type="email" />
        </label>

        <label class="field">
          <span class="field-label">Password</span>
          <input v-model="form.password" type="password" minlength="6" placeholder="Leave blank to keep current password" />
        </label>

        <label class="field">
          <span class="field-label">Level</span>
          <select v-model.number="form.level">
            <option v-for="option in levelOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="field">
          <span class="field-label">Role</span>
          <input :value="LEVEL_ROLE_MAP[form.level ?? 3]" disabled />
        </label>

        <label class="field checkbox-inline">
          <input v-model="form.isActive" type="checkbox" />
          <span>Account is active</span>
        </label>
      </div>

      <div class="form-section">
        <div class="panel-header compact">
          <div>
            <div class="field-label">Permissions</div>
            <p class="muted">Use the smallest permission set that still matches the user's job.</p>
          </div>
          <button class="btn ghost small" type="button" @click="applyLevelDefaults">Reset to level defaults</button>
        </div>

        <div class="permission-groups">
          <section v-for="group in PERMISSION_GROUPS" :key="group.label" class="permission-group">
            <h4>{{ group.label }}</h4>
            <div class="checkbox-grid">
              <label v-for="permission in group.items" :key="permission" class="checkbox-card">
                <input
                  :checked="form.permissions?.includes(permission)"
                  type="checkbox"
                  @change="togglePermission(permission)"
                />
                <span>{{ permissionLabel(permission) }}</span>
              </label>
            </div>
          </section>
        </div>
      </div>

      <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

      <div class="action-bar split">
        <div class="inline-actions">
          <button class="btn primary" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Saving...' : 'Save changes' }}
          </button>
          <NuxtLink class="btn ghost" to="/admin/accounts">Cancel</NuxtLink>
        </div>

        <button class="btn danger" type="button" :disabled="isDeleting" @click="removeUser">
          {{ isDeleting ? 'Deleting...' : 'Delete account' }}
        </button>
      </div>
    </form>
  </section>
</template>
