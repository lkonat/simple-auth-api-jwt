// module.exports = {
//   spaces: `CREATE TABLE IF NOT EXISTS spaces (
//       space_id TEXT NOT NULL PRIMARY KEY,
//       ts INTEGER NOT NULL
//   );`,
//
//   space_members:`CREATE TABLE IF NOT EXISTS space_members(
//       member_id TEXT NOT NULL PRIMARY KEY,
//       user_id TEXT NOT NULL,
//       space_id TEXT NOT NULL,
//       space_name TEXT NOT NULL,
//       ts INTEGER NOT NULL,
//       role INTEGER NOT NULL DEFAULT 1,
//       UNIQUE(space_name,user_id),
//       FOREIGN KEY(space_id) REFERENCES spaces (space_id) ON DELETE CASCADE
//   );`,
//   items:`CREATE TABLE IF NOT EXISTS items (
//             item_id TEXT NOT NULL PRIMARY KEY,
//             parent_id TEXT NOT NULL DEFAULT "root",
//             space_id TEXT NOT NULL,
//             name TEXT NOT NULL,
//             type TEXT NOT NULL,
//             UNIQUE(name,parent_id),
//             FOREIGN KEY(space_id) REFERENCES spaces (space_id) ON DELETE CASCADE
//   );`,
//   folders:`CREATE TABLE IF NOT EXISTS folders (
//             folder_id TEXT NOT NULL PRIMARY KEY,
//             item_id TEXT NOT NULL UNIQUE,
//             FOREIGN KEY(item_id) REFERENCES items (item_id) ON DELETE CASCADE
//   );`,
//   flashcards:`CREATE TABLE IF NOT EXISTS flashcards (
//             flashcard_id TEXT NOT NULL PRIMARY KEY,
//             item_id TEXT NOT NULL UNIQUE,
//             FOREIGN KEY(item_id) REFERENCES items (item_id) ON DELETE CASCADE
//   );`,
//
//   cards:`CREATE TABLE IF NOT EXISTS cards (
//             card_id TEXT NOT NULL PRIMARY KEY,
//             flashcard_id TEXT NOT NULL,
//             title TEXT NOT NULL,
//             type TEXT NOT NULL,
//             pos INTEGER,
//             UNIQUE(title,flashcard_id),
//             FOREIGN KEY(flashcard_id) REFERENCES flashcards (flashcard_id) ON DELETE CASCADE
//   );`,
//
//   basicCards:`CREATE TABLE IF NOT EXISTS basicCards (
//             basic_card_id TEXT NOT NULL PRIMARY KEY,
//             card_id TEXT NOT NULL UNIQUE,
//             text TEXT NOT NULL,
//             FOREIGN KEY(card_id) REFERENCES cards (card_id) ON DELETE CASCADE
//   );`,
// };


module.exports = {
  spaces: `CREATE TABLE IF NOT EXISTS spaces (
      space_id TEXT NOT NULL PRIMARY KEY,
      ts INTEGER NOT NULL
  );`,

  space_members:`CREATE TABLE IF NOT EXISTS space_members(
      member_id TEXT NOT NULL PRIMARY KEY,
      user_id TEXT NOT NULL,
      space_id TEXT NOT NULL,
      space_name TEXT NOT NULL,
      ts INTEGER NOT NULL,
      role INTEGER NOT NULL DEFAULT 1,
      UNIQUE(space_name,user_id),
      FOREIGN KEY(space_id) REFERENCES spaces (space_id) ON DELETE CASCADE
  );`,
  items:`CREATE TABLE IF NOT EXISTS items (
            item_id TEXT NOT NULL PRIMARY KEY,
            parent_id TEXT,
            space_id TEXT NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            UNIQUE(space_id,name,parent_id),
            FOREIGN KEY(space_id) REFERENCES spaces (space_id) ON DELETE CASCADE,
            FOREIGN KEY(parent_id) REFERENCES folders (folder_id) ON DELETE CASCADE
  );`,
  folders:`CREATE TABLE IF NOT EXISTS folders (
            folder_id TEXT NOT NULL PRIMARY KEY,
            item_id TEXT NOT NULL UNIQUE,
            FOREIGN KEY(item_id) REFERENCES items (item_id) ON DELETE CASCADE
  );`,
  flashcards:`CREATE TABLE IF NOT EXISTS flashcards (
            flashcard_id TEXT NOT NULL PRIMARY KEY,
            item_id TEXT NOT NULL UNIQUE,
            FOREIGN KEY(item_id) REFERENCES items (item_id) ON DELETE CASCADE
  );`,

  cards:`CREATE TABLE IF NOT EXISTS cards (
            card_id TEXT NOT NULL PRIMARY KEY,
            flashcard_id TEXT NOT NULL,
            title TEXT NOT NULL,
            type TEXT NOT NULL,
            pos INTEGER,
            UNIQUE(title,flashcard_id),
            FOREIGN KEY(flashcard_id) REFERENCES flashcards (flashcard_id) ON DELETE CASCADE
  );`,

  basicCards:`CREATE TABLE IF NOT EXISTS basicCards (
            basic_card_id TEXT NOT NULL PRIMARY KEY,
            card_id TEXT NOT NULL UNIQUE,
            text TEXT NOT NULL,
            FOREIGN KEY(card_id) REFERENCES cards (card_id) ON DELETE CASCADE
  );`,
};
