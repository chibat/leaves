CREATE TABLE app_user (
id SERIAL PRIMARY KEY,
google_id TEXT,
account TEXT,
name TEXT,
picture TEXT,
notification BOOLEAN DEFAULT false,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT app_user_google_id UNIQUE(google_id)
);

CREATE TABLE post (
 id SERIAL PRIMARY KEY,
 user_id INTEGER REFERENCES app_user(id) ON DELETE CASCADE,
 source TEXT,
 draft BOOLEAN DEFAULT false,
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX post_user_id ON post(user_id);
CREATE INDEX post_source_index ON post USING pgroonga (source);
ALTER TABLE post ADD column draft BOOLEAN DEFAULT false;

CREATE TABLE revision (
 id SERIAL PRIMARY KEY,
 post_id INTEGER,
 source TEXT,
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX revision_post_id ON revision(post_id);

CREATE OR REPLACE FUNCTION insert_revision() RETURNS TRIGGER AS $insert_revision$
    BEGIN
        IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') THEN
            INSERT INTO revision(post_id, source, created_at) SELECT OLD.id, OLD.source, OLD.created_at;
            RETURN OLD;
        END IF;
        RETURN NULL;
    END;
$insert_revision$ LANGUAGE plpgsql;

CREATE TRIGGER insert_revision_trigger
AFTER UPDATE OR DELETE ON post
FOR EACH ROW EXECUTE PROCEDURE insert_revision();

CREATE TABLE app_session (
 id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
 user_id INTEGER NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX app_session_user_id ON app_session(user_id);

CREATE TABLE comment (
 id SERIAL PRIMARY KEY,
 post_id INTEGER REFERENCES post(id) ON DELETE CASCADE,
 user_id INTEGER REFERENCES app_user(id) ON DELETE CASCADE,
 source TEXT,
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX comment_post_id ON comment(post_id);

CREATE TABLE follow (
 user_id INTEGER REFERENCES app_user(id) ON DELETE CASCADE,
 following_user_id INTEGER,
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY (user_id, following_user_id)
);

CREATE TYPE notification_type AS ENUM ('follow', 'like', 'comment');

CREATE TABLE notification (
 id SERIAL PRIMARY KEY,
 user_id INTEGER REFERENCES app_user(id) ON DELETE CASCADE,
 type notification_type NOT NULL,
 action_user_id INTEGER REFERENCES app_user(id) ON DELETE CASCADE,
 post_id INTEGER REFERENCES post(id) ON DELETE CASCADE,
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX notification_user_id ON notification(user_id);

CREATE TABLE likes (
 user_id INTEGER REFERENCES app_user(id) ON DELETE CASCADE,
 post_id INTEGER REFERENCES post(id) ON DELETE CASCADE,
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY (user_id, post_id)
);


----

select * from select_posts_by_word('todo', null, null);

CREATE OR REPLACE FUNCTION select_posts_by_word(search_word TEXT, login_user_id INTEGER , post_id INTEGER)
RETURNS TABLE(
    id integer,
    user_id integer,
    source text,
    updated_at timestamp with time zone,
    created_at timestamp with time zone,
    draft boolean,
    name text,
    picture text,
    comments int8,
    likes int8
) AS
$$
BEGIN
RETURN QUERY (
  SELECT
    v.id,
    v.user_id,
    v.source,
    v.updated_at,
    v.created_at,
    v.draft,
    v.name,
    v.picture,
    v.comments,
    v.likes
  FROM post_view v
  WHERE v.source &@~ search_word
  AND (v.draft = false 
  OR (login_user_id IS NOT NULL AND v.user_id = login_user_id)
  )
  AND (v.id < post_id OR post_id IS NULL)
  ORDER BY v.id DESC LIMIT 10
);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION select_following_users_posts(login_user_id INTEGER , post_id INTEGER)
RETURNS TABLE(
    id integer,
    user_id integer,
    source text,
    updated_at timestamp with time zone,
    created_at timestamp with time zone,
    draft boolean,
    name text,
    picture text,
    comments int8,
    likes int8
) AS
$$
BEGIN
RETURN QUERY (
  SELECT
    v.id,
    v.user_id,
    v.source,
    v.updated_at,
    v.created_at,
    v.draft,
    v.name,
    v.picture,
    v.comments,
    v.likes
  FROM post_view v
  WHERE v.draft = false AND  v.user_id IN (SELECT f.following_user_id FROM follow f WHERE f.user_id = login_user_id)
  AND (post_id IS NULL OR v.id < post_id)
  ORDER BY v.id DESC LIMIT 10
);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION select_liked_posts(login_user_id INTEGER , post_id INTEGER)
RETURNS TABLE(
    id integer,
    user_id integer,
    source text,
    updated_at timestamp with time zone,
    created_at timestamp with time zone,
    draft boolean,
    name text,
    picture text,
    comments int8,
    likes int8
) AS
$$
BEGIN
RETURN QUERY (
  SELECT
    v.id,
    v.user_id,
    v.source,
    v.updated_at,
    v.created_at,
    v.draft,
    v.name,
    v.picture,
    v.comments,
    v.likes
  FROM post_view v
  WHERE v.draft = false AND v.id IN (SELECT l.post_id FROM likes l WHERE l.user_id = login_user_id)
  AND (post_id IS NULL OR v.id < post_id)
  ORDER BY v.id DESC LIMIT 10
);
END;
$$ LANGUAGE plpgsql;

create view user_view
as
SELECT user_id, max(updated_at) as updated_at FROM post GROUP BY user_id ORDER BY user_id
;





CREATE OR REPLACE FUNCTION get_notification_for_comment(p_post_id integer, p_user_id integer)
RETURNS TABLE("user_id" integer, "type" notification_type, "post_id" integer, "action_user_id" integer)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY (
  SELECT p.user_id, 'comment'::notification_type, p_post_id, p_user_id
  FROM post p
  WHERE p.id=p_post_id AND p.user_id != p_user_id
  UNION
  SELECT DISTINCT c.user_id, 'comment'::notification_type, p_post_id, p_user_id
  FROM comment c
  WHERE c.post_id=p_post_id AND c.user_id != p_user_id
  );
END
$$;

CREATE OR REPLACE FUNCTION insert_notification_for_comment(p_post_id integer, p_user_id integer)
RETURNS void
AS $$
BEGIN
  INSERT INTO notification ("user_id", "type", "post_id", "action_user_id")
  SELECT "user_id", "type", "post_id", "action_user_id" FROM get_notification_for_comment(p_post_id, p_user_id)
  ;
  -- TODO I want to store the result of insert "user_id" in a variable and use it in update.
  UPDATE app_user SET NOTIFICATION = true WHERE id in (SELECT user_id FROM get_notification_for_comment(p_post_id, p_user_id))
  ;
END;
$$ LANGUAGE plpgsql;

