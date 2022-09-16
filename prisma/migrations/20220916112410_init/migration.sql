/*
  Warnings:

  - A unique constraint covering the columns `[tableName,userAddress]` on the table `TableUser` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TableUser_tableName_userAddress_key" ON "TableUser"("tableName", "userAddress");
