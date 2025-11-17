<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Sign up',
  description: 'Create an account to get started'
})

const toast = useToast()

const fields = [{
  name: 'name',
  type: 'text' as const,
  label: 'Name',
  placeholder: 'Enter your name'
}, {
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Enter your email'
}, {
  name: 'password',
  label: 'Password',
  type: 'password' as const,
  placeholder: 'Enter your password'
}, {
  name: 'otp',
  type: 'otp',
  label: 'OTP',
  length: 4,
  placeholder: '○'
}]
const { fetch, openInPopup, loggedIn } = useUserSession()
watch(loggedIn, (value) => {
  if (value) {
    navigateTo('/dashboard')
  }
})
const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  onClick: () => {
    openInPopup('/auth/google')
  }
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  onClick: () => {
    openInPopup('/auth/github')
  }
}]

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters'),
  otp: z.string().array().optional()
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log(authForm.value)
  if (!otpSent.value) {
    await sendOtp(payload.data.email)
    return
  }
  if (!payload.data.otp || payload.data.otp.length !== 4) {
    toast.add({ title: 'Error', description: 'Please enter a valid 4-digit OTP', color: 'error' })
    return
  }
  const otp = payload.data.otp.join('')
  await $fetch('/api/signup', {
    method: 'POST',
    body: { ...payload.data, otp }
  }).then(async () => {
    toast.add({ title: 'Success', description: 'Account created', color: 'success' })
    await fetch()
    await navigateTo('/dashboard')
  }).catch((err) => {
    toast.add({ title: 'Error', description: 'Account creation failed:\n' + err.data?.message, color: 'error' })
  })
}
const otpSent = ref(false)
const sendOtp = async (email: string) => {
  // Logic to send OTP
  await $fetch('/api/email', {
    method: 'POST',
    body: {
      email: email
    }
  }).then(() => {
    otpSent.value = true
    toast.add({ title: 'Success', description: 'OTP sent to your email', color: 'success' })
  }).catch((err) => {
    toast.add({ title: 'Error', description: 'Failed to send OTP:\n' + err.data?.message, color: 'error' })
  })
}
const authForm = useTemplateRef('authForm')
</script>

<template>
  <UAuthForm
    ref="authForm"
    :fields="fields"
    :schema="schema"
    :providers="providers"
    title="Create an account"
    :submit="{ label: otpSent ? 'Create account' : 'Send OTP' }"
    @submit="onSubmit"
  >
    <template #description>
      Already have an account? <ULink to="/login" class="text-primary font-medium">Login</ULink>.
    </template>

    <template #footer>
      <div v-if="otpSent" class="text-primary font-medium" @click="sendOtp(authForm.state.email)">
        Resend OTP
      </div>
      By signing up, you agree to our <ULink to="/" class="text-primary font-medium">Terms of Service</ULink>.
    </template>
  </UAuthForm>
</template>
