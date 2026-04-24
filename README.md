# ZenTime
[DFS] Projet Fil Rouge - Système de gestion de la santé et du bien-être en entreprise.

ZenTime est une application web permettant de prévenir les risques psychosociaux, de suivre le stress et de planifier des pauses bien-être en entreprise.

## 🚀 Stack Technique

* **Frontend & Framework** : Next.js 16.2 (App Router)
* **Authentification** : Auth.js v5 (NextAuth @beta)
* **Sécurité** : Bcrypt (Hachage des mots de passe) & Proxy (anciennement Middleware, pour la protection des routes)
* **Base de données** : MariaDB/MySQL
* **Infrastructure** : Docker & Docker Compose (Environnement conteneurisé multi-stage)
* **ORM** : Prisma 7 avec Driver Adapters (@prisma/adapter-mariadb)
* **Design & Icônes** : Tailwind CSS & Lucide-React

## 📋 État d'avancement (Milestones)

#### ✅ Milestone 0.1 : Setup & Database
- Initialisation du projet Next.js.
- Configuration de Prisma 7 avec MariaDB.
- Modélisation du schéma (Utilisateurs, Rôles).
- Script de Seed pour les données initiales.

#### ✅ Milestone 0.2 : Authentification & Sécurité (Actuel)
- Mise en place de Auth.js v5.
- Gestion des sessions via Server Components.
- Sécurisation des accès via le **Proxy** (nouveau standard Next.js 16).
- Hachage des mots de passe avec Bcrypt.
- Landing page dynamique et action de déconnexion.
- Conteneurisation globale de l'application via Docker.

## 🛠️ Installation et Démarrage

### 1. Cloner le projet
```bash
git clone [https://github.com/ZineddineBE/ZenTime.git](https://github.com/ZineddineBE/ZenTime.git)
cd zentime
`git clone https://github.com/ZineddineBE/ZenTime.git`
`cd zentime`

### 2. Configurer l'environnement
# Variables pour l'adaptateur Prisma et l'application
DATABASE_URL="mysql://root:root@db:3306/zentime_db"
DB_HOST="db"
DB_PORT=3306
DB_USER="root"
DB_PASSWORD="root"
DB_NAME="zentime_db"

# NextAuth v5
AUTH_SECRET="votre_secret_genere_ici"
AUTH_URL="http://localhost:3000"

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

### Prisma Studio (via Docker)
Pour visualiser et éditer les données en base de manière visuelle directement depuis le conteneur :
`docker exec -it -e HOST=0.0.0.0 zentime npx prisma studio --port 5555 --browser none`