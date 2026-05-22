<template>
  <div class="overflow-x-auto rounded-xl border border-glass ">
    <table class="min-w-full text-sm text-left">
      <!-- Header -->
      <thead class="bg-surface/60  uppercase">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3 font-semibold"
            :class="{
              'text-center': col.align === 'center',
              'text-right': col.align === 'right',
            }"
            :style="col.width ? { width: col.width } : undefined"
          >
            {{ col.label }}
          </th>
      
          <th v-if="actions.length > 0" class="px-4 py-3 font-semibold text-center w-32">
            Ações
          </th>
        </tr>
      </thead>

      <!-- Body -->
      <tbody class="divide-y divide-glass">
        <tr
          v-for="(row, index) in data"
          :key="index"
          class="hover:bg-surface/30 transition-colors duration-150"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3 text-slate-200"
            :class="{
              'text-center': col.align === 'center',
              'text-right': col.align === 'right',
            }"
          >
            {{ col.formatter ? col.formatter(row[col.key], row) : row[col.key] }}
          </td>
          <td v-if="actions.length > 0" class="px-4 py-3">
            <div class="flex items-center justify-center gap-2">
              <button
                v-for="action in actions"
                :key="action.key"
                @click="$emit('action', action.key, row)"
                class="p-1.5 rounded-md transition-all duration-200"
                :class="actionClass(action.variant)"
                :title="action.label"
              >
                <!-- Edit icon -->
                <svg v-if="action.icon === 'edit'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <!-- Delete icon -->
                <svg v-else-if="action.icon === 'delete'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <!-- Remove icon -->
                <svg v-else-if="action.icon === 'remove'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <!-- Fallback: text -->
                <span v-else class="text-xs font-medium">{{ action.label }}</span>
              </button>
            </div>
          </td>
        </tr>

        <!-- Empty state -->
        <tr v-if="data.length === 0">
          <td
            :colspan="columns.length + (actions.length > 0 ? 1 : 0)"
            class="px-4 py-12 text-center text-slate-500"
          >
            <svg class="w-12 h-12 mx-auto mb-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            {{ emptyMessage }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn, TableAction } from '@/types'

interface Props {
  columns: TableColumn[]
  data: Record<string, unknown>[]
  actions?: TableAction[]
  emptyMessage?: string
}

withDefaults(defineProps<Props>(), {
  actions: () => [],
  emptyMessage: 'Nenhum registro encontrado.',
})

defineEmits<{
  action: [key: string, row: Record<string, unknown>]
}>()

function actionClass(variant?: string): string {
  switch (variant) {
    case 'danger':
      return 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
    case 'warning':
      return 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
    default:
      return 'text-primary-light hover:text-primary hover:bg-primary/10'
  }
}
</script>
