/*
  Warnings:

  - You are about to drop the `dados` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dadosarquivados` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `dados` DROP FOREIGN KEY `dados_usuarioId_fkey`;

-- DropForeignKey
ALTER TABLE `dadosarquivados` DROP FOREIGN KEY `dadosArquivados_usuarioId_fkey`;

-- DropTable
DROP TABLE `dados`;

-- DropTable
DROP TABLE `dadosarquivados`;

-- CreateTable
CREATE TABLE `celulares` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `marca` VARCHAR(100) NOT NULL,
    `modelo` VARCHAR(255) NOT NULL,
    `memoriaRam` INTEGER NOT NULL,
    `armazenamento` INTEGER NOT NULL,
    `preco` DECIMAL(10, 2) NOT NULL,
    `usuarioId` INTEGER NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `celularArquivados` (
    `id` INTEGER NOT NULL,
    `marca` VARCHAR(100) NOT NULL,
    `modelo` VARCHAR(255) NOT NULL,
    `memoriaRam` INTEGER NOT NULL,
    `armazenamento` INTEGER NOT NULL,
    `preco` DECIMAL(10, 2) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `usuarioId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `celulares` ADD CONSTRAINT `celulares_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `celularArquivados` ADD CONSTRAINT `celularArquivados_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
