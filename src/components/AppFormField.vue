<template>

  <div class="flex flex-col gap-2">

    <label
      v-if="label"
      class="text-sm font-semibold text-[#2f2f2f]"
    >
      {{ label }}
    </label>

    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      class="input-glass"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />

  </div>

</template>

<script setup lang="ts">

interface Props {

  modelValue?: string

  label?: string

  placeholder?: string

  type?: string
}

withDefaults(
  defineProps<Props>(),
  {
    type: 'text'
  }
)

defineEmits([
  'update:modelValue'
])

</script>
