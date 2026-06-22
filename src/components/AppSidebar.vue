<template>
  <aside class="sidebar w-64 min-h-screen p-4">

    <div class="mb-10 flex items-center justify-center">
      <img
        src="/logo.png"
        class="h-16 object-contain"
      />
    </div>

    <nav class="flex flex-col gap-2">

      <RouterLink
        to="/upload"
        class="sidebar-item px-4 py-3 rounded-xl font-medium"
      >
        Upload Automático
      </RouterLink>

      <RouterLink
        to="/upload-periodo"
        class="sidebar-item px-4 py-3 rounded-xl font-medium"
      >
        Upload por Período
      </RouterLink>

     <RouterLink
  to="/upload-excel"
  class="sidebar-item px-4 py-3 rounded-xl font-medium"
>
  Upload Excel (Em desenvolvimento <strong>Não Utilizar</strong>)
</RouterLink>

    </nav>

  </aside>
</template>

<script setup lang="ts">
</script>
