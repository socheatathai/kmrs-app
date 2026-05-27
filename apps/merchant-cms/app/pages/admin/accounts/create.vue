<script setup lang="ts">
import type { CreateManagedUserRequest } from '@kmrs-app/types'
import {
  LEVEL_DEFAULT_PERMISSIONS,
  LEVEL_LABELS,
  LEVEL_ROLE_MAP,
  PERMISSION_GROUPS,
  normalizePermissions,
  permissionLabel
} from '~/constants/user-access'

const client = useApiClient()
const session = useSessionStore()

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin', 'permission'],
  permission: 'account.create'
})

const levelOptions = computed(() =>
  session.level <= 1
    ? [
        { value: 2, label: LEVEL_LABELS[2] },
        { value: 3, label: LEVEL_LABELS[3] }
      ]
    : [{ value: 3, label: LEVEL_LABELS[3] }]
)

const initialLevel = levelOptions.value[0]?.value ?? 3
const initialRole = LEVEL_ROLE_MAP[initialLevel] ?? 'STAFF'
const initialPermissions = LEVEL_DEFAULT_PERMISSIONS[initialLevel] ?? LEVEL_DEFAULT_PERMISSIONS[3] ?? []

const form = reactive<CreateManagedUserRequest>({
  name: '',
  email: '',
  password: '',
  role: initialRole,
  level: initialLevel,
  permissions: [...initialPermissions]
})

const isSubmitting = ref(false)
const errorMessage = ref('')

watch(
  () => form.level,
  (level) => {
    form.role = LEVEL_ROLE_MAP[level] ?? 'STAFF'
    form.permissions = [...(LEVEL_DEFAULT_PERMISSIONS[level] ?? LEVEL_DEFAULT_PERMISSIONS[3] ?? [])]
  },
  { immediate: true }
)

const togglePermission = (permission: string) => {
  const permissions = form.permissions ?? []

  if (permissions.includes(permission)) {
    form.permissions = permissions.filter((item) => item !== permission)
    return
  }

  form.permissions = normalizePermissions([...permissions, permission])
}

const submit = async () => {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const user = await client.createUser({
      ...form,
      permissions: normalizePermissions(form.permissions ?? [])
    })

    await navigateTo(`/admin/accounts/${user.id}`)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to create account.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="panel page-stack">
    <div class="panel-header">
      <div>
        <h3>Create Account</h3>
        <p class="muted">Create a managed user with level defaults, then trim or extend permissions if needed.</p>
      </div>
      <NuxtLink class="btn ghost" to="/admin/accounts">Back to accounts</NuxtLink>
    </div>

    <form class="form page-stack" @submit.prevent="submit">
      <div class="form-grid two">
        <label class="field">
          <span class="field-label">Name</span>
          <input v-model.trim="form.name" required maxlength="120" placeholder="Staff Demo" />
        </label>

        <label class="field">
          <span class="field-label">Email</span>
          <input v-model.trim="form.email" required type="email" placeholder="staff@example.com" />
        </label>

        <label class="field">
          <span class="field-label">Password</span>
          <input v-model="form.password" required type="password" minlength="6" placeholder="At least 6 characters" />
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
          <input :value="form.role" disabled />
        </label>
      </div>

      <div class="form-section">
        <div>
          <div class="field-label">Permissions</div>
          <p class="muted">Defaults are derived from level. Change only what the account actually needs.</p>
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

      <div class="inline-actions">
        <button class="btn primary" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Creating...' : 'Create account' }}
        </button>
        <NuxtLink class="btn ghost" to="/admin/accounts">Cancel</NuxtLink>
      </div>
    </form>
  </section>
</template>
