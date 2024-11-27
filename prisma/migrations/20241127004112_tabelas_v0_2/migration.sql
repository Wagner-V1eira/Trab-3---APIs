/*
  Warnings:

  - You are about to drop the `celulararquivados` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `celulararquivados` DROP FOREIGN KEY `celularArquivados_usuarioId_fkey`;

-- DropTable
DROP TABLE `celulararquivados`;
