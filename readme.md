# Projet Node.js avec Prisma

Ce projet utilise Node.js, Express et Prisma comme ORM pour la gestion de la base de données.

## 🚀 Installation

1. Clonez le repository
```bash
git clone [url-du-repo]
cd [nom-du-projet]
```

2. Installez les dépendances
```bash
npm install
```

3. Configurez votre fichier `.env` avec vos variables d'environnement
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="80d7c8af7b2edad52c773b9d68f8ee2ae78abfd7726e3a211edb82394341c23c44bb242bcfbdf3e85a5863edb99319a3c368e5e6b2dee563390f10982718bfed"
```
Le JWT_SECRET sera utilisé pour signer et vérifier les tokens JWT.


## 📋 Commandes disponibles

### Démarrer le serveur
```bash
node index.js
```

### Base de données

#### Réinitialiser la base de données
```bash
npx prisma migrate reset
```
Cette commande va :
- Supprimer la base de données
- Recréer la base de données
- Appliquer toutes les migrations

#### Seed la base de données
```bash
node prisma/seed.js
```
Cette commande va peupler votre base de données avec des données initiales.

#### Interface Prisma Studio
```bash
npx prisma studio
```
Prisma Studio est une interface graphique pour visualiser et modifier vos données. Elle sera accessible à l'adresse : `http://localhost:5555`

## 🛠 Scripts de Migration

### Créer une nouvelle migration
```bash
npx prisma migrate dev --name [nom_de_la_migration]
```

### Appliquer les migrations en production
```bash
npx prisma migrate deploy
```

## 📚 Documentation utile

- [Documentation Prisma](https://www.prisma.io/docs/)
- [Documentation Express](https://expressjs.com/fr/)
- [Documentation Node.js](https://nodejs.org/fr/docs/)

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Push sur la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request
