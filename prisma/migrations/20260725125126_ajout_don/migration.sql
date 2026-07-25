-- CreateTable
CREATE TABLE `Don` (
    `id_don` INTEGER NOT NULL AUTO_INCREMENT,
    `montant_centimes` INTEGER NOT NULL,
    `devise` VARCHAR(191) NOT NULL DEFAULT 'eur',
    `stripe_session_id` VARCHAR(191) NOT NULL,
    `statut` VARCHAR(191) NOT NULL DEFAULT 'en_attente',
    `date_don` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_utilisateur` INTEGER NULL,

    UNIQUE INDEX `Don_stripe_session_id_key`(`stripe_session_id`),
    PRIMARY KEY (`id_don`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Don` ADD CONSTRAINT `Don_id_utilisateur_fkey` FOREIGN KEY (`id_utilisateur`) REFERENCES `Utilisateur`(`id_utilisateur`) ON DELETE SET NULL ON UPDATE CASCADE;
