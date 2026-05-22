<template>
  <aside
  :class="
      'fixed top-0 left-0 h-full bg-sidebar-bg z-30 flex flex-col transition-all duration-300 ease-in-out w-[260px]'
  "
  >
    <!-- Logo / Brand -->
    <div class="px-6 py-6 border-b border-glass">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent
                    flex items-center justify-center shadow-glow">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <h1 class="text-lg font-bold text-slate-100 leading-tight">Upload</h1>
          <p class="text-xs text-slate-500 font-medium">Caule System</p>
        </div>
      </div>
    </div>

    <!-- User info -->
    <div class="px-5 py-4 border-b border-glass">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary-dark to-primary
                    flex items-center justify-center text-white text-sm font-bold">
          {{ userInitials }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-slate-200 truncate">{{ userName }}</p>
          <p class="text-xs text-slate-500">{{ userLevelLabel }}</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <!-- Usuários (somente nível 1) -->
      <!-- router-link
        v-if="canAccessUsers"
        to="/users"
        class="sidebar-link group"
        active-class="sidebar-link-active"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span>Usuários</span>
      </router-link>

      <!-- Upload (todos) -->
      <router-link
        to="/upload"
        class="sidebar-link group"
        active-class="sidebar-link-active"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span>Upload</span>
      </router-link>
    </nav>

    <!-- Sair -->
    <div class="px-3 py-4 border-t border-glass">
      <router-link
        to="/logout"
        class="sidebar-link group text-red-400 hover:text-red-300"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span>Sair</span>
      </router-link>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { UserLevelLabels } from '@/types'

const authStore = useAuthStore()

const userName = computed(() => authStore.user?.nome ?? 'Usuário')
const userInitials = computed(() => {
  const name = authStore.user?.nome ?? 'U'
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

const userLevelLabel = computed(() => {
  if (!authStore.user) return ''
  return UserLevelLabels[authStore.user.nivel] ?? ''
})

const canAccessUsers = computed(() => authStore.canAccessUsers)
</script>

<style scoped>
.sidebar-link {
  @apply flex items-center gap-3 px-3 py-2.5 rounded-lg
         text-sm font-medium text-slate-400
         transition-all duration-200
         hover:text-slate-100 hover:bg-surface;
}

.sidebar-link-active {
  @apply text-white bg-gradient-to-r from-primary/20 to-transparent
         border-l-2 border-primary;
}
</style>
