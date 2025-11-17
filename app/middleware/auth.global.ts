export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()
  if (!loggedIn.value && to.path.startsWith('/dashboard')) {
    return navigateTo('/login')
  }
})
