export default eventHandler(async () => {
  const db = useDrizzle()
  const users = await db.query.users.findMany()
  const customers = []
  for (const user of users) {
    customers.push({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: { src: user.avatar },
      status: 'subscribed',
      location: 'London, UK'
    })
  }
  return customers
})
