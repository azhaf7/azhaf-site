# Azhaf Khan

Portfolio site for [azhaf.com](https://www.azhaf.com/). Projects sit on a shelf as 3D books. Open one and it turns toward you like a hardcover. The same projects can also be read as a plain list.

## Run it

```bash
npm install
npm run dev
```

Vite prints a local URL, usually [http://localhost:5173](http://localhost:5173). If that port is taken, it uses the next one.

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |

## What’s on the page

- The opening screen is the name. Scroll and the view flies through a letter onto the page.
- **About**, **Projects**, **Hobbies**, and **Contact** are sections on the same page.
- Books can be dragged to rearrange the shelf. The order is remembered in the browser.
- The colour menu in the header switches the site between olive and blush.
- Contact copies the email address, and the form opens the visitor’s mail app. There is no backend.

A book opens at `/:slug`. The list view opens the same project in a window at `/project/:slug`.

## Where to edit

| Change | File |
| --- | --- |
| Projects | `src/data/books.js` |
| About and hobbies | `src/data/folio.js` |
| Name, email, links, CV | `src/data/profile.js` |
| Olive and blush themes | `src/styles/press.css` and `src/components/ThemeButton.jsx` |

Book covers, endpapers, and page textures live in `public/covers`, `public/endpapers`, and `public/pages`. Screenshots for a project go in `public/projects/<slug>/` and are listed on that book as `photos`.

## Deploy

Pushes to `main` build the site and publish it to GitHub Pages at [azhaf.com](https://www.azhaf.com/). The workflow is `.github/workflows/pages.yml`.

The previous static site is on the [`old-website`](https://github.com/azhaf7/azhaf-site/tree/old-website) branch.

## Stack

React, React Router, and Vite. Motion is CSS 3D plus a small amount of hand-written animation. The name sequence is in `src/components/ui/glyph-portal.tsx`.
