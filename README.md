# LetterFox

Le ciné-club privé de la bande — un journal de visionnage type Letterboxd pour les films et séries, partagé entre amis.

## Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript)
- [Supabase](https://supabase.com) — authentification et base de données Postgres
- [TMDB](https://www.themoviedb.org) — recherche et métadonnées des films/séries
- Déployé sur [Vercel](https://vercel.com)

## Développement local

```bash
npm install
cp .env.example .env.local   # renseigner les variables Supabase et TMDB
npm run dev
```

Le schéma de base de données vit dans `supabase/migrations/`.
