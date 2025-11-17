export default defineEventHandler(async (event) => {
  const { name, email, password, otp } = await readBody(event)
  const db = useDrizzle()
  // validate otp is correct
  const emailOtp = await db.query.email.findMany({ where: eq(tables.email.email, email), orderBy: [desc(tables.email.createdAt)], limit: 1 })
  if (emailOtp[0]?.code !== otp) {
    throw createError({
      statusCode: 401,
      message: 'Invalid OTP'
    })
  }
  await db.delete(tables.email).where(eq(tables.email.email, email))
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email)
  })
  if (user) {
    throw createError({
      statusCode: 401,
      message: 'User already exists'
    })
  }
  // Hash password
  const hashedPassword = await hashPassword(password)
  // Create user
  const [newUser] = await db.insert(tables.users).values({
    name,
    email,
    password: hashedPassword
  }).returning()
  await setUserSession(event, { user: newUser })
  return user
})
