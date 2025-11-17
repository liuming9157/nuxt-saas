<script setup lang="ts">
import * as z from 'zod'
import type { FormError } from '@nuxt/ui'

const passwordSchema = z.object({
  current: z.string().min(8, 'Must be at least 8 characters'),
  new: z.string().min(8, 'Must be at least 8 characters')
})

type PasswordSchema = z.output<typeof passwordSchema>

const password = reactive<Partial<PasswordSchema>>({
  current: undefined,
  new: undefined
})

const validate = (state: Partial<PasswordSchema>): FormError[] => {
  const errors: FormError[] = []
  if (state.current && state.new && state.current === state.new) {
    errors.push({ name: 'new', message: 'Passwords must be different' })
  }
  return errors
}
const toast = useToast()
const onSubmit = async () => {
  await $fetch('/api/dashboard/users', { method: 'POST', body: password }).then(() => {
    toast.add({
      title: 'Success',
      description: 'Your password have been updated.',
      icon: 'i-lucide-check',
      color: 'success'
    })
  }).catch((err) => {
    toast.add({
      title: 'Error',
      description: 'Your password could not be updated:\n' + err.data?.message,
      icon: 'i-lucide-alert-triangle',
      color: 'error'
    })
  })
}
const deleteAccount = async () => {
  toast.add({
    title: 'Error',
    description: 'Your can not delete account',
    icon: 'i-lucide-alert-triangle',
    color: 'error'
  })
}
</script>

<template>
  <UPageCard title="Password" description="Confirm your current password before setting a new one." variant="subtle">
    <UForm
      :schema="passwordSchema"
      :state="password"
      :validate="validate"
      class="flex flex-col gap-4 max-w-xs"
    >
      <UFormField name="current">
        <UInput
          v-model="password.current"
          type="password"
          placeholder="Current password"
          class="w-full"
        />
      </UFormField>

      <UFormField name="new">
        <UInput
          v-model="password.new"
          type="password"
          placeholder="New password"
          class="w-full"
        />
      </UFormField>

      <UButton
        label="Update"
        class="w-fit"
        type="submit"
        @click="onSubmit"
      />
    </UForm>
  </UPageCard>

  <UPageCard
    title="Account"
    description="No longer want to use our service? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently."
    class="bg-gradient-to-tl from-error/10 from-5% to-default"
  >
    <template #footer>
      <UButton label="Delete account" color="error" @click="deleteAccount" />
    </template>
  </UPageCard>
</template>
