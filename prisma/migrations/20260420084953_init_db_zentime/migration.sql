-- CreateTable
CREATE TABLE `Role` (
    `id_role` INTEGER NOT NULL AUTO_INCREMENT,
    `libelle_role` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Role_libelle_role_key`(`libelle_role`),
    PRIMARY KEY (`id_role`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Type` (
    `id_type` INTEGER NOT NULL AUTO_INCREMENT,
    `libelle_type` VARCHAR(191) NOT NULL,
    `description_type` VARCHAR(191) NULL,
    `duree_type` INTEGER NULL,

    UNIQUE INDEX `Type_libelle_type_key`(`libelle_type`),
    PRIMARY KEY (`id_type`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Utilisateur` (
    `id_utilisateur` INTEGER NOT NULL AUTO_INCREMENT,
    `nom_utilisateur` VARCHAR(191) NOT NULL,
    `prenom_utilisateur` VARCHAR(191) NOT NULL,
    `date_naissance_utilisateur` DATETIME(3) NULL,
    `mail_utilisateur` VARCHAR(191) NOT NULL,
    `mdp_utilisateur` VARCHAR(191) NOT NULL,
    `consentement_rgpd_utilisateur` BOOLEAN NOT NULL DEFAULT false,
    `id_utilisateur_1` INTEGER NULL,
    `id_role` INTEGER NOT NULL,

    UNIQUE INDEX `Utilisateur_mail_utilisateur_key`(`mail_utilisateur`),
    PRIMARY KEY (`id_utilisateur`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pause` (
    `id_pause` INTEGER NOT NULL AUTO_INCREMENT,
    `heure_debut_pause` DATETIME(3) NULL,
    `heure_fin_pause` DATETIME(3) NULL,
    `id_type` INTEGER NOT NULL,
    `id_utilisateur` INTEGER NOT NULL,

    PRIMARY KEY (`id_pause`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SuiviStress` (
    `id_suivi_stress` INTEGER NOT NULL AUTO_INCREMENT,
    `date_suivi_stress` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `niveau_suivi_stress` INTEGER NOT NULL,
    `id_utilisateur` INTEGER NOT NULL,

    PRIMARY KEY (`id_suivi_stress`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Utilisateur` ADD CONSTRAINT `Utilisateur_id_utilisateur_1_fkey` FOREIGN KEY (`id_utilisateur_1`) REFERENCES `Utilisateur`(`id_utilisateur`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Utilisateur` ADD CONSTRAINT `Utilisateur_id_role_fkey` FOREIGN KEY (`id_role`) REFERENCES `Role`(`id_role`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pause` ADD CONSTRAINT `Pause_id_type_fkey` FOREIGN KEY (`id_type`) REFERENCES `Type`(`id_type`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pause` ADD CONSTRAINT `Pause_id_utilisateur_fkey` FOREIGN KEY (`id_utilisateur`) REFERENCES `Utilisateur`(`id_utilisateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SuiviStress` ADD CONSTRAINT `SuiviStress_id_utilisateur_fkey` FOREIGN KEY (`id_utilisateur`) REFERENCES `Utilisateur`(`id_utilisateur`) ON DELETE RESTRICT ON UPDATE CASCADE;
