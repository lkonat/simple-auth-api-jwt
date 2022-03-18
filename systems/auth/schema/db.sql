

CREATE TABLE IF NOT EXISTS spaces (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    ts INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS space_members(
    id TEXT NOT NULL PRIMARY KEY,
    user_id TEXT NOT NULL,
    space_id TEXT NOT NULL,
    ts INTEGER NOT NULL,
    FOREIGN KEY(space_id) REFERENCES spaces (id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS items (
          id TEXT NOT NULL PRIMARY KEY,
          parent_id TEXT NOT NULL DEFAULT 0,
          space_id TEXT NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          UNIQUE(name,parent_id),
          FOREIGN KEY(space_id) REFERENCES spaces (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS folders (
          id TEXT NOT NULL PRIMARY KEY,
          item_id TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          FOREIGN KEY(item_id) REFERENCES items (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS flashcards (
          id TEXT NOT NULL PRIMARY KEY,
          item_id TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          FOREIGN KEY(item_id) REFERENCES items (id) ON DELETE CASCADE
);



--
-- CREATE TABLE IF NOT EXISTS cards (
--           id TEXT NOT NULL PRIMARY KEY,
--           flashcard_id TEXT NOT NULL,
--           name TEXT NOT NULL,
--           type TEXT NOT NULL,
--           FOREIGN KEY(flashcard_id) REFERENCES flashcard (id) ON DELETE CASCADE
-- );


INSERT INTO items(id,name,type) VALUES("item-1","today","directory");
INSERT INTO items(id,name,type) VALUES("item-2","yesterday","directory");
INSERT INTO items(id,name,type) VALUES("item-3","last week","directory");
INSERT INTO items(id,name,type) VALUES("item-4","file","file");
