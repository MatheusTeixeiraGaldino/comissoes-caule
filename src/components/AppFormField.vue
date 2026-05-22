<template>
  <div class="flex flex-col gap-1.5">
    <label
      v-if="label"
      :for="inputId"
      class="text-xs font-semibold text-slate-400 uppercase tracking-wider"
    >
      {{ label }}
      <span v-if="required" class="text-red-400">*</span>
    </label>

    <!-- Select -->
    <select
      v-if="type === 'select'"
      :id="inputId"
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="input-glass appearance-none pr-10
             bg-[url('data:image/svg+xml,%3Csvg+xmlns=%27http://www.w3.org/2000/svg%27+width=%2712%27+height=%2712%27+viewBox=%270+0+12+12%27%3E%3Cpath+fill=%27%2394a3b8%27+d=%27M6+8L1+3h10z%27/%3E%3C/svg%3E')]
             bg-no-repeat bg-[right_12px_center]"
      :class="{ 'input-error': !!error }"
    >
      <option value="" disabled class="bg-dark-secondary">{{ placeholder || 'Selecione...' }}</option>
      <option
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
        class="bg-dark-secondary"
      >
        {{ opt.label }}
      </option>
    </select>

    <!-- Regular Input -->
    <input
      v-else
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      class="input-glass"
      :class="{ 'input-error': !!error }"
    />

    <!-- Error message -->
    <p class="text-xs text-red-400 min-h-[18px]">{{ error || '' }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SelectOption {
  value: string | number
  label: string
}

interface Props {
  label?: string
  type?: string
  modelValue: string | number
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  options?: SelectOption[]
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  error: '',
  required: false,
  disabled: false,
  options: () => [],
})

defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const inputId = computed(
  () => `field-${props.label?.toLowerCase().replace(/\s+/g, '-') ?? Math.random().toString(36).slice(2)}`
)
</script>
