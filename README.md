# Streaming Playlist Migration - Backend 
 
 ## Récupérer le dépot Git

Suivre une des méthodes de récupération du dépot (Https, SSH, CLI, zip) via la partie "Code" a la racine de la page Git

## Installer les dépendances

Se placer à la racine du projet depuis un terminal ayant le module npm installé. Lancer une des commandes suivantes selon le build souhaité:

+ `npm install` pour installer toutes dépendances (pour un build en développement)
+ `npm install --production` pour installer les dépendances, sans les dépendances de développement (pour un build en production)

## Remplir les variables d'environnement

Dupliquer le fichier calque `.env.dist` à la racine du projet, le renommer en `.env` et saisir les variables.

## Lancer le serveur (pour du développement)

Dans le cas où seul du développement est réalisé sur le projet, lancer la commande suivante à la racine du projet dans un terminal pour lancer le serveur npm

+ `npm start`

## Effectuer un Build de l'application

Lancer `npm run prebuild` pour faire un build du projet. Les fichiers créés par le build se trouvent dans le dossier `dist/`.

## Placer le build sur un serveur

+ Placer le build contenu dans le dossier `dist/`, le fichier `.env` et `package.json` dans le serveur cible
+ Modifier la configuration du serveur web (Nginx, Apache, ...) pour lancer l'application
+ Lancer un script sur le serveur qui va lancer la commande `node server.js` pour démarrer le serveur