<template>
  <Teleport to="body">
    <TransitionGroup
      name="notification"
      tag="div"
      class="fixed top-4 right-4 z-[60] flex flex-col gap-3 pointer-events-none"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="pointer-events-auto max-w-sm w-full glass-card px-4 py-3
               flex items-start gap-3 animate-slide-up cursor-pointer"
        :class="borderClass(notification.type)"
        @click="remove(notification.id)"
      >
        <!-- Icon -->
        <div class="flex-shrink-0 mt-0.5">
          <!-- Success -->
          <svg v-if="notification.type === 'success'" class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <!-- Error -->
          <svg v-else-if="notification.type === 'error'" class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <!-- Warning -->
          <svg v-else-if="notification.type === 'warning'" class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <!-- Info -->
          <svg v-else class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <!-- Message -->
        <p class="text-sm text-slate-200 flex-1">{{ notification.message }}</p>

        <!-- Close -->
        <button class="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Notification } from '@/types'

const notifications = ref<Notification[]>([])

function add(type: Notification['type'], message: string, duration = 4000): void {
  const id = Math.random().toString(36).slice(2)
  notifications.value.push({ id, type, message, duration })

  if (duration > 0) {
    setTimeout(() => remove(id), duration)
  }
}

function remove(id: string): void {
  notifications.value = notifications.value.filter((n) => n.id !== id)
}

function borderClass(type: string): string {
  switch (type) {
    case 'success': return 'border-l-2 border-l-emerald-400'
    case 'error': return 'border-l-2 border-l-red-400'
    case 'warning': return 'border-l-2 border-l-amber-400'
    default: return 'border-l-2 border-l-blue-400'
  }
}

// Expose methods for parent components
defineExpose({ add, remove })
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
