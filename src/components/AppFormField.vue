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

    <!-- SELECT -->
    <select
      v-if="type === 'select'"
      :id="inputId"
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="input-glass appearance-none pr-10 bg-no-repeat bg-right"
      :class="{ 'input-error': !!error }"
    >
      <option value="" disabled>
        {{ placeholder || 'Selecione...' }}
      </option>

      <option
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
      >
        {{ opt.label }}
      </option>
    </select>

    <!-- INPUT -->
    <input
      v-else
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input-glass"
      :class="{ 'input-error': !!error }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />

    <p
      v-if="error"
      class="text-xs text-red-400 mt-1"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Option {
  label: string
  value: string | number
}

interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  error?: string
  type?: string
  required?: boolean
  disabled?: boolean
  inputId?: string
  options?: Option[]
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  inputId: '',
  options: () => []
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.input-glass {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #334155;
  background: #0f172a;
  color: white;
  outline: none;
}

.input-glass:focus {
  border-color: #3b82f6;
}

.input-error {
  border-color: #ef4444;
}
</style>
