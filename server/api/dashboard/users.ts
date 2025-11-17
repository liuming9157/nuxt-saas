export default eventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)
  let data
  if (body.new) {
    // Hash new password
    data = { password: await hashPassword(body.new) }
  } else {
    data = { name: body.name, email: body.email, avatar: body.avatar, bio: body.bio }
  }
  // TODO： validate body fields
  const db = useDrizzle()
  const user = await db.query.users.findFirst({
    where: (users, { eq, ne, and }) => and(eq(tables.users.email, body.email), ne(tables.users.id, session.user.id))
  })
  if (user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Email already in use'
    })
  }
  await db.update(tables.users).set(data).where((eq(tables.users.id, session.user.id)))
  await replaceUserSession(event, data)
  return { success: true }
})
