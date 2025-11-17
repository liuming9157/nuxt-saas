import { pgTable, varchar, pgEnum, timestamp, index, uniqueIndex, json, smallint } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

const timestamps = {
  createdAt: timestamp().defaultNow().notNull()
}

export const providerEnum = pgEnum('provider', ['github', 'google'])
export const roleEnum = pgEnum('role', ['user', 'assistant'])
export const statusEnum = pgEnum('status', ['pending', 'paid', 'cancelled'])

export const users = pgTable('users', {
  id: varchar({ length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar({ length: 255 }).notNull(),
  password: varchar({ length: 255 }).notNull().$defaultFn(() => crypto.randomUUID()),
  name: varchar({ length: 100 }).notNull(),
  avatar: varchar({ length: 500 }).notNull().default('/avatar.png'),
  username: varchar({ length: 50 }).notNull().$defaultFn(() => crypto.randomUUID()),
  bio: varchar({ length: 200 }),
  loginip: varchar({ length: 45 }).default(''),
  logintime: timestamp().defaultNow(),
  ...timestamps
}, table => [
  uniqueIndex('users_email_idx').on(table.email)
])

export const accounts = pgTable('accounts', {
  id: varchar({ length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar({ length: 36 }).notNull(),
  provider: providerEnum(),
  providerId: varchar({ length: 50 }),
  refresh_token: varchar({ length: 45 }).default(''),
  access_token: varchar({ length: 45 }).default(''),
  expires_at: smallint(),
  scope: varchar({ length: 45 }).default(''),
  token_type: varchar({ length: 45 }).default(''),
  id_token: varchar({ length: 45 }).default(''),
  ...timestamps
}, table => [
  index('accounts_user_id_idx').on(table.userId)
])

export const subscription = pgTable('subscription', {
  id: varchar({ length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar({ length: 36 }).notNull(),
  stripeCustomerId: varchar({ length: 50 }),
  stripeSubscriptionId: varchar({ length: 50 }),
  stripePriceId: varchar({ length: 50 }),
  stripeCurrentPeriodEnd: timestamp(),
  status: statusEnum().default('pending'),
  ...timestamps
}, table => [
  index('subscrption_user_id_idx').on(table.userId)
])

export const email = pgTable('email', {
  id: varchar({ length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar({ length: 255 }).notNull(),
  code: varchar({ length: 100 }).notNull(),
  ...timestamps
})

export const usersRelations = relations(users, ({ many }) => ({
  chats: many(chats)
}))

export const chats = pgTable('chats', {
  id: varchar({ length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: varchar({ length: 200 }),
  userId: varchar({ length: 36 }).notNull(),
  ...timestamps
}, table => [
  index('chats_user_id_idx').on(table.userId)
])

export const chatsRelations = relations(chats, ({ one, many }) => ({
  user: one(users, {
    fields: [chats.userId],
    references: [users.id]
  }),
  messages: many(messages)
}))

export const messages = pgTable('messages', {
  id: varchar({ length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  chatId: varchar({ length: 36 }).notNull().references(() => chats.id, { onDelete: 'cascade' }),
  role: roleEnum().notNull(),
  parts: json(),
  ...timestamps
}, table => [
  index('messages_chat_id_idx').on(table.chatId)
])

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id]
  })
}))
