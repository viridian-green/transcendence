ALTER TABLE friends
ADD CONSTRAINT friends_ordered CHECK (user_one < user_two);
