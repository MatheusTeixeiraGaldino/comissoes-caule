<template>

  <div class="card overflow-auto">

    <table class="w-full">

      <thead>

        <tr>

          <th class="text-left p-4">
            Nome
          </th>

          <th class="text-left p-4">
            E-mail
          </th>

          <th class="text-left p-4">
            Perfil
          </th>

        </tr>

      </thead>

      <tbody>

        <tr
          v-for="item in items"
          :key="item.id"
          class="hover:bg-[#fff7ed]"
        >

          <td class="p-4">
            {{ item.nome }}
          </td>

          <td class="p-4">
            {{ item.email }}
          </td>

          <td class="p-4">
            {{ item.perfil }}
          </td>

        </tr>

      </tbody>

    </table>

  </div>

</template>

<script setup lang="ts">

interface TableItem {

  id: string | number

  nome?: string

  email?: string

  perfil?: string
}

defineProps<{
  items: TableItem[]
}>()

</script>
