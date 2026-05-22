

<template>
  <div class="min-h-screen bg-background">
    <AppSidebar 
      :collapsed="collapsed" 
      @toggle="toggleCollapsed"
    />
    <TopBar :sidebar-collapsed="collapsed" />
    <main
      :class="'pt-[10px] min-h-screen transition-all duration-300 ml-[260px]'"
    >
   
      <div class="p-2 lg:p-2">
        <router-view />
      </div>
    </main>
  </div>


</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import AppNotification from '@/components/AppNotification.vue'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const authStore = useAuthStore()

const notificationRef = ref<InstanceType<typeof AppNotification> | null>(null)

               const collapsed = ref(false)

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value
}


// Provide notification methods to all child components
provide('notify', (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
  notificationRef.value?.add(type, message)
})

const pageTitle = computed(() => (route.meta.title as string) ?? 'Dashboard')

const userInitials = computed(() => {
  const name = authStore.user?.nome ?? 'U'
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
})

const currentDate = computed(() => {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())
})
</script>
