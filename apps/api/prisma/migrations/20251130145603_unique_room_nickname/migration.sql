/*
  Warnings:

  - A unique constraint covering the columns `[room_id,nickname]` on the table `room_participants` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "room_participants_room_id_nickname_key" ON "room_participants"("room_id", "nickname");
