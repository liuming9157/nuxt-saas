export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user: googleUser }) {
    const db = useDrizzle()
    const session = await getUserSession(event)

    let user = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.email, googleUser.email)
    })
    if (!user) {
      [user] = await db.insert(tables.users).values({
        id: session.id,
        name: googleUser.name || '',
        email: googleUser.email || '',
        avatar: googleUser.picture || '',
        username: googleUser.name || ''
      }).returning()
      await db.insert(tables.accounts).values({
        userId: user.id,
        provider: 'google',
        providerId: googleUser.sub,
        accessToken: '',
        refreshToken: ''
      })
    }
    const account = await db.query.accounts.findFirst({
      where: (account, { eq }) => and(eq(account.userId, user.id), eq(account.provider, 'google'), eq(account.providerId, googleUser.sub))
    })
    if (!account) {
      await db.insert(tables.accounts).values({
        userId: user.id,
        provider: 'google',
        providerId: googleUser.sub,
        accessToken: '',
        refreshToken: ''
      })
    }

    await setUserSession(event, { user })

    return sendRedirect(event, '/dashboard')
  },
  // Optional, will return a json error and 401 status code by default
  onError(event, error) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/')
  }
})
