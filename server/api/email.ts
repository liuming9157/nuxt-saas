import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || '')

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event)
  const randomCode = Math.floor(1000 + Math.random() * 9000)
  const db = useDrizzle()
  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'Nuxt SaaS Starter<onboarding@resend.dev>',
    to: [email],
    subject: 'Your verification code',
    html: `<strong>Your verification code is ${randomCode}</strong>`
  })
  if (result.error) {
    throw createError({
      statusCode: 401,
      message: result.error.message
    })
  }
  await db.insert(tables.email).values({
    email: email,
    code: randomCode
  })
  return { code: randomCode }
})
