import { openDatabase, SQLError } from "expo-sqlite";

import { IChat } from "../api/chats/chatApi";
import { IMessage } from "../api/chats/messagesApi";
import { IChatPreview } from "../contexts/ChatsSyncingContext";
import { IChatMetadata } from "../hooks/chats/useChatMetadata";
import { getCurrentUserId } from "../utils/auth/currentUser";

// TODO: rename to chats instead of chats2
const DB_NAME = "chats2";
const MESSAGES_TABLE_NAME = "messages";
const READ_TABLE_NAME = "readUpTo";
const CHATS_TABLE_NAME = "chats";
const CHATS_MEMBERS_TABLE_NAME = "chats_members";

const TABLE_DEFINITIONS = {
  chats: `
    CREATE TABLE IF NOT EXISTS ${CHATS_TABLE_NAME} (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT,
      private INTEGER,
      left INTEGER
    )`,
  chatsMembers: `
    CREATE TABLE IF NOT EXISTS ${CHATS_MEMBERS_TABLE_NAME} (
      member TEXT,
      chatId TEXT,
      name TEXT,
      imageUrl TEXT,
      PRIMARY KEY (member, chatId),
      FOREIGN KEY(chatId) REFERENCES ${CHATS_TABLE_NAME}(id)
    )`,
  messages: `
    CREATE TABLE IF NOT EXISTS ${MESSAGES_TABLE_NAME} (
      id TEXT PRIMARY KEY NOT NULL,
      chatId TEXT,
      sender TEXT,
      message TEXT,
      date NUMBER NOT NULL UNIQUE,
      FOREIGN KEY(chatId) REFERENCES ${CHATS_TABLE_NAME}(id)
    )`,
  readUpTo: `
    CREATE TABLE IF NOT EXISTS ${READ_TABLE_NAME} (
      member TEXT,
      chatId TEXT,
      messageDate NUMBER NOT NULL,
      PRIMARY KEY (member, chatId),
      FOREIGN KEY(chatId) REFERENCES ${CHATS_TABLE_NAME}(id)
    )
  `,
};

export class ChatsDb {
  private db = openDatabase(DB_NAME);

  constructor() {
    this.initTables();
  }

  public async reset(): Promise<void> {
    console.log("closing database");
    this.db.closeAsync();
    await this.db.deleteAsync();
    this.db = openDatabase(DB_NAME);
    await this.initTables();
    console.log("deleted database");
  }

  private initTables() {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          for (const table of Object.values(TABLE_DEFINITIONS)) {
            tx.executeSql(table, [], undefined, (_: unknown, err: SQLError) => {
              console.error(err);
              return false;
            });
          }
        },
        (err) => reject(err),
        () => resolve(undefined)
      );
    });
  }

  public getMessages(chatId: string): Promise<IMessage[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction((transaction) => {
        transaction.executeSql(
          `SELECT * FROM ${MESSAGES_TABLE_NAME} WHERE chatId = ?`,
          [chatId],
          (_, { rows }) => {
            resolve(
              rows._array.map((row) => {
                return {
                  id: row.id,
                  chatId: row.chatId,
                  date: new Date(row.date),
                  from: row.sender,
                  message: row.message,
                };
              })
            );
          },
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  // this assumes timestamps are unique
  public getChatPreviews(): Promise<IChatPreview[]> {
    const currentUserId = getCurrentUserId();

    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            `SELECT c.id as chatId, c.title as title, r.unread as unread,
            meta.name as messageFromName,
            m.date as messageDate, m.id as messageId, m.sender as messageFrom, m.message as messageMessage
          FROM ${MESSAGES_TABLE_NAME} m
          INNER JOIN ${CHATS_MEMBERS_TABLE_NAME} meta
            ON meta.chatId = c.id AND meta.member = m.sender
          INNER JOIN (
            SELECT mm.chatId, MAX(mm.date) as newestDate
            FROM ${MESSAGES_TABLE_NAME} mm
            GROUP BY mm.chatId
          ) m2 ON m.chatId = m2.chatId AND m.date = m2.newestDate
          INNER JOIN ${CHATS_TABLE_NAME} c ON m.chatId = c.id
          INNER JOIN (
            SELECT r.chatId, count(mmm.date) as unread
            FROM ${READ_TABLE_NAME} r
            INNER JOIN ${CHATS_TABLE_NAME} c
              ON r.chatId = c.id
            LEFT JOIN ${MESSAGES_TABLE_NAME} mmm
              ON mmm.chatId = c.id
              AND mmm.date > r.messageDate
            WHERE r.member = ?
            GROUP BY r.chatId
          ) r ON c.id = r.chatId
        `,
            [currentUserId],
            (_, results) =>
              resolve(
                results.rows._array.map((row) => {
                  return {
                    chatId: row.chatId,
                    title: row.title,
                    unreadCount: row.unread,
                    lastMessage: {
                      id: row.messageId,
                      date: new Date(row.messageDate),
                      from: {
                        uid: row.messageFrom,
                        name: row.messageFromName,
                      },
                      message: row.messageMessage,
                    },
                  };
                })
              ),
            (_, err) => {
              console.error(err);
              reject(err);
              return false;
            }
          );
        },
        (err) => console.error("transaction", err)
      );
    });
  }

  // TODO: update chat interfaces with private
  public getChatMetadata(chatId: string): Promise<IChatMetadata> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            `
          SELECT c.id as id, c.title as title, c.private as private,
            m.member as uid, m.name as name, m.imageUrl as imageUrl
          FROM ${CHATS_TABLE_NAME} c
          INNER JOIN ${CHATS_MEMBERS_TABLE_NAME} m
            ON c.id = m.chatId
          WHERE c.id = ?`,
            [chatId],
            (_, result) => {
              const metadata = result.rows._array.reduce<IChatMetadata>(
                (metadata, row) => {
                  metadata.id = row.id;
                  metadata.title = row.title;
                  metadata.members.push(row.uid);
                  metadata.private = row.private === 1;
                  metadata.membersMetadata[row.uid] = {
                    name: row.name,
                    imageUrl: row.imageUrl,
                  };

                  return metadata;
                },
                { members: [], membersMetadata: {} } as any
              );

              resolve(metadata);
            }
          );
        },
        (err) => reject(err)
      );
    });
  }

  public addMessages(messages: IMessage[]): Promise<void> {
    if (messages.length === 0) return Promise.resolve();
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        const insertValues = messages.flatMap((message) => {
          return [
            message.id,
            message.chatId,
            message.from,
            message.message,
            message.date.getTime(),
          ];
        });
        tx.executeSql(
          `INSERT INTO ${MESSAGES_TABLE_NAME}
                (id, chatId, sender, message, date)
                VALUES
                ${"(?, ?, ?, ?, ?),".repeat(messages.length).slice(0, -1)}`,
          insertValues,
          () => resolve(),
          // TODO
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  public addOrUpdateChats(chats: IChat[]): Promise<void> {
    if (chats.length === 0) return Promise.resolve();
    console.log("addOrUpdateChats", chats);
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          const insertValues = chats.flatMap((chat) => {
            return [chat.id, chat.title, chat.private ? 1 : 0, 0];
          });
          tx.executeSql(
            `INSERT OR REPLACE INTO ${CHATS_TABLE_NAME}
            (id, title, private, left)
            VALUES
            ${"(?, ?, ?, ?),".repeat(chats.length).slice(0, -1)}`,
            insertValues
          );
          const membersInsertValues = chats.flatMap((chat) => {
            return Object.entries(chat.membersMetadata).flatMap(
              ([uid, metadata]) => {
                return [uid, chat.id, metadata.name, metadata.imageUrl];
              }
            );
          });
          // TODO set left=1 for chats where id NOT IN [chats.id]
          tx.executeSql(
            `INSERT OR IGNORE INTO ${CHATS_MEMBERS_TABLE_NAME}
            (member, chatId, name, imageUrl)
            VALUES
            ${"(?, ?, ?, ?),"
              .repeat(membersInsertValues.length / 4)
              .slice(0, -1)}`,
            membersInsertValues
          );

          const readUpToInsertValues = chats.flatMap((chat) => {
            return Object.entries(chat.readUpTo).flatMap(([userId, date]) => [
              userId,
              chat.id,
              date.getTime(),
            ]);
          });
          tx.executeSql(
            `INSERT OR REPLACE INTO ${READ_TABLE_NAME}
             (member, chatId, messageDate)
             VALUES
             ${"(?, ?, ?),"
               .repeat(readUpToInsertValues.length / 3)
               .slice(0, -1)}`,
            readUpToInsertValues
          );
        },
        (err) => console.error("Could not update chats", err),
        () => resolve()
      );
    });
  }

  public async getPrivateChatId(userId: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            `
            SELECT c.id as chatId
            FROM ${CHATS_TABLE_NAME} c
            INNER JOIN ${CHATS_MEMBERS_TABLE_NAME} m
              ON c.id = m.chatId
            WHERE c.private = 1
            AND m.member = ?
          `,
            [userId],
            (_, result) => {
              if (result.rows.length === 0) resolve(null);
              else resolve(result.rows._array[0].chatId);
            }
          );
        },
        (err) => reject(err)
      );
    });
  }
}
