<script setup lang="ts">
interface DataTableColumn {
  key: string
  label: string
  class?: string
  sortable?: boolean
  valueKey?: string
  sortKey?: string
}

interface DataTableFilter {
  key: string
  label: string
  options: {
    label: string
    value: string
  }[]
}

const props = withDefaults(defineProps<{
  columns: DataTableColumn[]
  rows: any[]
  filters?: DataTableFilter[]
  searchableKeys?: string[]
  searchPlaceholder?: string
  pageSizeOptions?: number[]
  initialPageSize?: number
  showToolbar?: boolean
  showFooter?: boolean
  rowKey?: string
  rowClass?: string
}>(), {
  filters: () => [],
  searchableKeys: undefined,
  searchPlaceholder: 'Search',
  pageSizeOptions: () => [5, 10, 25, 50],
  initialPageSize: 10,
  showToolbar: true,
  showFooter: true,
  rowKey: 'id',
  rowClass: ''
})

const search = ref('')
const currentPage = ref(1)
const pageSize = ref(props.initialPageSize)
const filterValues = reactive<Record<string, string>>({})
const sortKey = ref('')
const sortDirection = ref<'asc' | 'desc'>('asc')

watch(
  () => props.filters,
  (filters) => {
    for (const filter of filters) {
      filterValues[filter.key] ??= ''
    }
  },
  { immediate: true, deep: true }
)

const columnKeys = computed(() => props.searchableKeys?.length ? props.searchableKeys : props.columns.map((column) => column.key))

const getRowKey = (row: any, index: number) => {
  const value = row[props.rowKey]
  return typeof value === 'string' || typeof value === 'number' ? value : index
}

const readValue = (row: any, key: string) => {
  const value = key.split('.').reduce((current, part) => current?.[part], row)

  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

const filteredRows = computed(() => {
  const term = search.value.trim().toLowerCase()

  return props.rows.filter((row) => {
    const matchesSearch = !term || columnKeys.value.some((key) => readValue(row, key).toLowerCase().includes(term))
    const matchesFilters = props.filters.every((filter) => {
      const selected = filterValues[filter.key]

      return !selected || readValue(row, filter.key) === selected
    })

    return matchesSearch && matchesFilters
  })
})

const sortedRows = computed(() => {
  if (!sortKey.value) {
    return filteredRows.value
  }

  return [...filteredRows.value].sort((left, right) => {
    const leftValue = readValue(left, sortKey.value)
    const rightValue = readValue(right, sortKey.value)
    const result = leftValue.localeCompare(rightValue, undefined, { numeric: true, sensitivity: 'base' })

    return sortDirection.value === 'asc' ? result : -result
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / pageSize.value)))
const pageRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value

  return sortedRows.value.slice(start, start + pageSize.value)
})
const startCount = computed(() => sortedRows.value.length ? (currentPage.value - 1) * pageSize.value + 1 : 0)
const endCount = computed(() => Math.min(currentPage.value * pageSize.value, sortedRows.value.length))

watch([search, pageSize, filterValues], () => {
  currentPage.value = 1
})

watch(pageCount, (count) => {
  if (currentPage.value > count) {
    currentPage.value = count
  }
})

const toggleSort = (column: DataTableColumn) => {
  if (!column.sortable) {
    return
  }

  const key = column.sortKey ?? column.valueKey ?? column.key

  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    return
  }

  sortKey.value = key
  sortDirection.value = 'asc'
}
</script>

<template>
  <div class="data-table">
    <div v-if="showToolbar" class="table-toolbar">
      <input v-model="search" class="input table-search" type="search" :placeholder="searchPlaceholder">
      <select
        v-for="filter in filters"
        :key="filter.key"
        v-model="filterValues[filter.key]"
        class="select table-filter"
        :aria-label="`Filter by ${filter.label}`"
      >
        <option value="">All {{ filter.label }}</option>
        <option v-for="option in filter.options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <select v-model.number="pageSize" class="select table-size" aria-label="Rows per page">
        <option v-for="option in pageSizeOptions" :key="option" :value="option">
          {{ option }} rows
        </option>
      </select>
    </div>

    <div v-if="!pageRows.length" class="empty">No matching records.</div>

    <div v-else class="table">
      <div class="row head" :class="rowClass">
        <span v-for="column in columns" :key="column.key" :class="column.class">
          <button
            v-if="column.sortable"
            class="sort-button"
            type="button"
            @click="toggleSort(column)"
          >
            {{ column.label }}
            <span v-if="sortKey === (column.sortKey ?? column.valueKey ?? column.key)">{{ sortDirection === 'asc' ? 'Asc' : 'Desc' }}</span>
          </button>
          <template v-else>{{ column.label }}</template>
        </span>
      </div>
      <div v-for="(row, index) in pageRows" :key="getRowKey(row, index)" class="row" :class="rowClass">
        <span v-for="column in columns" :key="column.key" :class="column.class">
          <span class="mobile-cell-label">{{ column.label }}</span>
          <slot :name="`cell-${column.key}`" :row="row" :value="readValue(row, column.valueKey ?? column.key)">
            {{ readValue(row, column.valueKey ?? column.key) }}
          </slot>
        </span>
      </div>
    </div>

    <div v-if="showFooter" class="table-footer">
      <span class="muted">Showing {{ startCount }}-{{ endCount }} of {{ sortedRows.length }}</span>
      <div class="pager">
        <button class="button ghost" type="button" :disabled="currentPage <= 1" @click="currentPage -= 1">
          Previous
        </button>
        <span class="pager-count">Page {{ currentPage }} of {{ pageCount }}</span>
        <button class="button ghost" type="button" :disabled="currentPage >= pageCount" @click="currentPage += 1">
          Next
        </button>
      </div>
    </div>
  </div>
</template>
