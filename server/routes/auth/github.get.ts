export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user: ghUser }) {
    const db = useDrizzle()
    const session = await getUserSession(event)

    // let user = await db.query.users.findFirst({
    //   where: (user, { eq }) => and(eq(user.provider, 'github'), eq(user.providerId, ghUser.id.toString()))
    // })
    // if (!user) {
    //   [user] = await db.insert(tables.users).values({
    //     id: session.id,
    //     name: ghUser.name || '',
    //     email: ghUser.email || '',
    //     avatar: ghUser.avatar_url || '',
    //     username: ghUser.login,
    //     provider: 'github',
    //     providerId: ghUser.id.toString()
    //   }).returning()
    // } else {
    //   // Assign anonymous chats with session id to user
    //   await db.update(tables.chats).set({
    //     userId: user.id
    //   }).where(eq(tables.chats.userId, session.id))
    // }
    let user = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.email, ghUser.email)
    })
    if (!user) {
      [user] = await db.insert(tables.users).values({
        id: session.id,
        name: ghUser.name || '',
        email: ghUser.email || '',
        avatar: ghUser.avatar_url || '',
        username: ghUser.login
      }).returning()
      await db.insert(tables.accounts).values({
        userId: user.id,
        provider: 'github',
        providerId: ghUser.id.toString(),
        accessToken: '',
        refreshToken: ''
      })
    }

    const account = await db.query.accounts.findFirst({
      where: (account, { eq }) => and(eq(account.userId, user.id), eq(account.provider, 'github'), eq(account.providerId, ghUser.id.toString()))
    })
    if (!account) {
      await db.insert(tables.accounts).values({
        userId: user.id,
        provider: 'github',
        providerId: ghUser.id.toString(),
        accessToken: '',
        refreshToken: ''
      })
    }

    await setUserSession(event, { user })

    return sendRedirect(event, '/dashboard')
  },
  // Optional, will return a json error and 401 status code by default
  onError(event, error) {
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/')
  }
})
