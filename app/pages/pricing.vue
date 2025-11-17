<script setup lang="ts">
const { data: page } = await useAsyncData('pricing', () => queryCollection('pricing').first())

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

defineOgImageComponent('Saas')

const isYearly = ref('0')

const items = ref([
  {
    label: 'Monthly',
    value: '0'
  },
  {
    label: 'Yearly',
    value: '1'
  }
])

const toast = useToast()
const { loggedIn } = useUserSession()
const handlePurchase = async (_e: Event, index: number) => {
  if (!loggedIn.value) {
    await navigateTo('/login')
  }
  // 免费版不处理购买逻辑
  if (index === 0) {
    toast.add({
      title: 'Free plan is not available for purchase',
      color: 'warning'
    })
    return
  }
  const plan = page.value?.plans[index]
  if (!plan) {
    return
  }
  const data = {
    title: plan.title,
    price: isYearly.value === '1' ? (plan.price?.year || 0) : (plan.price?.month || 0),
    isYearly: isYearly.value
  }
  await $fetch('/api/subscription', {
    method: 'POST',
    body: data
  }).then((data) => {
    // Redirect to Stripe Checkout
    if (data && typeof data === 'string') {
      window.location.href = data
    }
  }).catch((err) => {
    toast.add({ title: 'Error', description: 'Invalid credentials:' + err.data?.message, color: 'error' })
  })
}
</script>

<template>
  <div v-if="page">
    <UPageHero
      :title="page.title"
      :description="page.description"
    >
      <template #links>
        <UTabs
          v-model="isYearly"
          :items="items"
          color="neutral"
          size="xs"
          class="w-48"
          :ui="{
            list: 'ring ring-accented rounded-full',
            indicator: 'rounded-full',
            trigger: 'w-1/2'
          }"
        />
      </template>
    </UPageHero>

    <UContainer>
      <UPricingPlans scale>
        <UPricingPlan
          v-for="(plan, index) in page.plans"
          :key="index"
          v-bind="plan"
          :price="isYearly === '1' ? plan.price.year : plan.price.month"
          :billing-cycle="isYearly === '1' ? '/year' : '/month'"
          :button="{
            ...plan.button,
            onClick: (e) => handlePurchase(e, index)
          }"
        />
      </UPricingPlans>
    </UContainer>

    <UPageSection>
      <UPageLogos>
        <UIcon
          v-for="icon in page.logos.icons"
          :key="icon"
          :name="icon"
          class="w-12 h-12 flex-shrink-0 text-muted"
        />
      </UPageLogos>
    </UPageSection>

    <UPageSection
      :title="page.faq.title"
      :description="page.faq.description"
    >
      <UAccordion
        :items="page.faq.items"
        :unmount-on-hide="false"
        :default-value="['0']"
        type="multiple"
        class="max-w-3xl mx-auto"
        :ui="{
          trigger: 'text-base text-highlighted',
          body: 'text-base text-muted'
        }"
      />
    </UPageSection>
  </div>
</template>
