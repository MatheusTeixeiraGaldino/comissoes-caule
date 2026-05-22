<template>

  <div class="flex min-h-screen bg-[#f8f8f8]">

    <AppSidebar />

    <main class="flex-1">

      <header class="header h-20 px-8 flex items-center justify-between">

        <h1 class="text-2xl font-bold text-[#2f2f2f]">
          Sistema de Comissões
        </h1>

      </header>

      <div class="p-8">

        <router-view />

      </div>

    </main>

  </div>

</template>

<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
</script>
