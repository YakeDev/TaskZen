# 🧭 Plan de projet — TaskZen To-Do List Avancée (Statistiques & Filtres)

## 🎯 1. Vue d'ensemble

**Nom du projet :** TaskZen (Statistiques & Filtrage)  
**But principal :** Permettre à l'utilisateur de créer, catégoriser, filtrer et suivre ses tâches, avec un tableau de bord de statistiques claires (tâches totales, terminées, en cours, par catégorie).

**MVP :**

- [ ] Ajouter une tâche (titre, catégorie, date optionnelle)
- [ ] Supprimer une tâche
- [ ] Marquer/demarquer comme terminée
- [ ] Filtrer par catégorie et par statut (toutes / terminées / en cours)
- [ ] Afficher des statistiques de base (total, terminé, en cours)

**Bonus :**

- [ ] Éditer une tâche (titre, catégorie)
- [ ] Rechercher par texte (search)
- [ ] Sauvegarde persistante (localStorage puis API)
- [ ] Tri (date création, alphabetical)
- [ ] UI améliorée (Tailwind), animations, responsive, light/dark theme

---

## 🧠 2. Expérience utilisateur (UX)

**Flux utilisateur :**

1. Ouvre l'app → voit la liste de tâches et le dashboard statistiques.
2. Ajoute une tâche rapide via le formulaire (titre obligatoire, catégorie facultative).
3. Filtre la liste par catégorie ou statut.
4. Coche une tâche terminée → statistiques mises à jour.
5. Supprime ou édite une tâche si besoin.

**Interactions principales :**

- Formulaire d'ajout (input texte, select catégorie, bouton Ajouter)
- Liste de tâches (checkbox pour complété, bouton éditer, bouton supprimer)
- Barre de filtrage (select catégories + boutons statut)
- Dashboard (tuiles: total / complétées / en attente / par catégorie)

**Wireframe rapide :**

- En-tête : titre + bouton "nouvelle tâche"
- Gauche (ou top) : formulaire + filtres
- Centre : liste des tâches
- Droite (ou bas mobile) : statistiques (cartes)

---

## 🏗️ 3. Structure du projet (suggestion)

```
/todo-advanced
├── index.html
├── styles.css        // ou tailwind.config + styles
├── /src
│   ├── app.js        // point d'entrée (initialisation)
│   ├── taskManager.js// logique CRUD (purs functions)
│   ├── ui.js         // rendu DOM, event listeners
│   ├── storage.js    // localStorage / API wrapper
│   └── stats.js      // calculs de statistiques
└── /assets
```

Si tu utilises React (optionnel) :

```
/src
├── App.jsx
├── components/
│   ├── TaskList.jsx
│   ├── TaskItem.jsx
│   ├── TaskForm.jsx
│   ├── Filters.jsx
│   └── Dashboard.jsx
└── utils/
    ├── storage.js
    └── stats.js
```

---

## 🧩 4. Modèle de données & fonctions (JS pur)

**Structure d'une tâche :**

```js
const task = {
	id: '1687349123456', // string ou number unique
	title: 'Apprendre Promises',
	description: 'Task description',
	category: 'Études',
	createdAt: '2025-10-10T12:00:00.000Z',
	dueDate: null, // optionnel
	status: 'Pending',
}
```

**Exemples de fonctions à implémenter (logique pure, sans DOM) :**

- `createTask(title, category, dueDate)`
- `deleteTask(id)`
- `updateTask(id, updates)`
- `toggleComplete(id)`
- `getTasks(filter)` -> retourne tableau filtré
- `getStats(tasks)` -> { total, completed, pending, byCategory: {..} }
- `saveTasks(tasks)` / `loadTasks()` (storage wrapper)

---

## 💻 5. Étapes de développement (par ordre)

1. Initialise le repo + README + structure de fichiers.
2. Implémente `taskManager.js` : CRUD pur + tests via console.
3. Crée UI minimal (index.html + form + list) et `ui.js` pour `renderTasks()` et lier événements.
4. Ajoute filtres (category + status) et `getTasks(filter)`.
5. Implémente `stats.js` et affiche le dashboard.
6. Ajoute `localStorage` (save & load) via `storage.js`.
7. Améliore UI (Tailwind), responsive, accessibilité.
8. Ajoute fonctionnalités bonus (edit, search, tri).
9. Tests, optimisations, et déploiement (Vercel/Netlify).

**Itérations courtes :** Fais des petites itérations (1 feature à la fois), commit souvent.

---

## 🎨 6. Design & UX (suggestions)

- Utilise Tailwind pour prototype rapide.
- Palette simple : 1 couleur primaire + 2 neutres.
- Cartes pour statistiques (icône + chiffre + label).
- Feedback utile : toasts pour suppression, confirmation modale pour suppression massive.
- Accessibilité : labels sur inputs, focus visibles, contrastes respectés.

---

## 💾 7. Persistance des données

**Phase 1 (simple) :** localStorage

```js
// save
localStorage.setItem('todo_tasks', JSON.stringify(tasks))
// load
JSON.parse(localStorage.getItem('todo_tasks') || '[]')
```

**Phase 2 (avancé) :** API REST (Node/Express) + DB (SQLite / Postgres / MongoDB)

- Routes : `GET /tasks`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`

---

## 🧪 8. Tests & edge-cases

- Empêcher l'ajout d'une tâche vide.
- Gérer doublons d'ID si tu utilises random id.
- Vérifier que le filtrage fonctionne avec catégories vides.
- Comportement si localStorage est plein ou absent (mode offline).
- Tests manuels : ajouter/supprimer/toggle/filtrer et vérifier stats.

---

## 📘 9. Documentation & déploiement

**README doit contenir :** but, features, capture d'écran, comment lancer (dev), commandes (si react/vite), et lien déployé.  
**Déploiement :** Netlify / Vercel (front). Si backend : Render / Railway.

---

## 🔁 10. Roadmap d'une semaine (exemple d'itération rapide)

**Jour 1 :** Setup repo, structure, `taskManager.js` (CRUD).  
**Jour 2 :** UI minimal + `renderTasks()` + connexion add/delete.  
**Jour 3 :** Toggle complete + filtres (status + category).  
**Jour 4 :** `stats.js` et affichage dashboard.  
**Jour 5 :** localStorage + load/save automatique.  
**Jour 6 :** Amélioration UI (Tailwind) + responsive.  
**Jour 7 :** Tests, README, déploiement.

---

## 🧾 11. Checklist finale (copiable)

- [ ] Repo initialisé + README
- [ ] CRUD tasks (logique)
- [ ] UI de base (add/delete/list)
- [ ] Toggle complete
- [ ] Filtrage par catégorie & statut
- [ ] Dashboard statistiques
- [ ] Sauvegarde localStorage
- [ ] Responsive + styles
- [ ] Edit task (bonus)
- [ ] Search & tri (bonus)
- [ ] Déploiement (Netlify/Vercel)

---

## 📝 Notes / idées

- Ajoute des catégories par défaut : Travail, Personnel, Études, Autre.
- Prévois une fonction `normalizeCategory(name)` pour éviter les doublons (ex: "Travail" vs "travail").
