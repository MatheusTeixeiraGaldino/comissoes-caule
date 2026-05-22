<template>

  <div class="card overflow-auto">

    <table class="w-full">

      <thead>

        <tr>

          <th
            v-for="column in columns"
            :key="column.key"
            class="text-left p-4"
          >
            {{ column.label }}
          </th>

          <th
            v-if="actions.length"
            class="text-left p-4"
          >
            Ações
          </th>

        </tr>

      </thead>

      <tbody>

        <tr
          v-for="item in data"
          :key="item.id"
          class="hover:bg-[#fff7ed]"
        >

          <td
            v-for="column in columns"
            :key="column.key"
            class="p-4"
          >
            {{ item[column.key] }}
          </td>

          <td
            v-if="actions.length"
            class="p-4 flex gap-2"
          >

            <button
              v-for="action in actions"
              :key="action.label"
              class="btn-primary"
              @click="onAction(action.key, item)"
            >
              {{ action.label }}
            </button>

          </td>

        </tr>

      </tbody>

    </table>

  </div>

</template>

<script setup lang="ts">

interface TableColumn {

  key: string

  label: string
}

interface TableAction {

  key: string

  label: string
}

interface TableItem {

  id: string | number

  [key: string]: any
}

defineProps<{

  columns: TableColumn[]

  data: TableItem[]

  actions: TableAction[]

  onAction: (action: string, item: TableItem) => void
}>()

</script>
