<template>
  <div class="min-h-[60vh] flex items-center justify-center">
    <div class="text-center animate-fade-in">
      <div class="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
      <p class="text-slate-400">Saindo...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

onMounted(() => {
  authStore.logout()
  setTimeout(() => router.push('/login'), 500)
})
</script>
