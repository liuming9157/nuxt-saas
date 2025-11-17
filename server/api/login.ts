export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)
  const db = useDrizzle()
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email)
  })
  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found'
    })
  }
  const isPasswordValid = await verifyPassword(user.password, password)
  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      message: 'Invalid password'
    })
  }
  const ip = getRequestIP(event)
  await db.update(tables.users).set({
    logintime: new Date(),
    loginip: ip
  }).where(eq(tables.users.id, user.id))
  await setUserSession(event, { user })
  return user
})
