# ZenTime
[DFS] Projet Fil Rouge - Système de gestion de la santé et du bien-être en entreprise.

ZenTime est une application web permettant de suivre le stress et de planifier des pauses bien-être en entreprise.

## Stack Technique

Frontend : Next.js 15 (App Router)
Base de données : MySQL (via Docker)
ORM : Prisma 7 avec Driver Adapters
Style : Tailwind CSS

## Installation et Démarrage

### 1. Cloner le projet
`git clone https://github.com/ZineddineBE/ZenTime.git`
`cd zentime`

### 2. Configurer l'environnement
Créez un .env avec :
`DATABASE_URL="mysql://root:root@localhost:3306/zentime_db"`

### 3. Lancer l'infrastructure (Docker)
Assurez-vous que Docker Desktop est lancé, puis :
`docker-compose up -d`


### 4. Installer les dépendances et générer Prisma
`npm install`
`npx prisma generate`

### 5. Initialiser la base de données (Migrations + Seed)
`npx prisma migrate dev --name init`
`npx prisma db seed`

### 6. Lancer l'application
`npm run dev`

## Outils de développement

### Prisma Studio
L'interface graphique pour visualiser les données en base.
`npx prisma studio`