import { pgTable, serial, text, timestamp, varchar, uuid, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const rooms = pgTable('rooms', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 6 }).notNull().unique(),
  name: varchar('name', { length: 50 }).notNull(),
  maxPlayers: integer('max_players').default(8),
  isPublic: boolean('is_public').default(true),
  currentWord: text('current_word'),
  currentDrawerId: text('current_drawer_id'),
  roundTime: integer('round_time').default(60),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const players = pgTable('players', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomId: uuid('room_id').references(() => rooms.id, { onDelete: 'cascade' }),
  userId: text('user_id'),
  name: varchar('name', { length: 30 }).notNull(),
  score: integer('score').default(0),
  isHost: boolean('is_host').default(false),
  lastActivity: timestamp('last_activity').defaultNow(),
});

export const gameRounds = pgTable('game_rounds', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomId: uuid('room_id').references(() => rooms.id, { onDelete: 'cascade' }),
  drawerId: uuid('drawer_id').references(() => players.id),
  word: text('word').notNull(),
  startTime: timestamp('start_time').defaultNow(),
  endTime: timestamp('end_time'),
  drawings: jsonb('drawings').default([]),
});

export const guesses = pgTable('guesses', {
  id: uuid('id').defaultRandom().primaryKey(),
  roundId: uuid('round_id').references(() => gameRounds.id, { onDelete: 'cascade' }),
  playerId: uuid('player_id').references(() => players.id),
  guess: text('guess').notNull(),
  isCorrect: boolean('is_correct').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define relations
export const roomsRelations = relations(rooms, ({ many }) => ({
  players: many(players),
  rounds: many(gameRounds),
}));

export const playersRelations = relations(players, ({ one }) => ({
  room: one(rooms, {
    fields: [players.roomId],
    references: [rooms.id],
  }),
}));

export const roundsRelations = relations(gameRounds, ({ one, many }) => ({
  room: one(rooms, {
    fields: [gameRounds.roomId],
    references: [rooms.id],
  }),
  drawer: one(players, {
    fields: [gameRounds.drawerId],
    references: [players.id],
  }),
  guesses: many(guesses),
}));
