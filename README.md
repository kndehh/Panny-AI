# Panny AI Companion - Frontend

This repository contains the Panny AI Companion frontend.

# Vercel Deployment (Frontend only)
If you use Vercel to deploy this project, it will try to detect serverless functions or server frameworks if there's a `server/` folder. To avoid deploying the server portion (and to prevent wrong platform detection), we've added an `.vercelignore` and a `vercel.json` that instruct Vercel to treat the repo as a static frontend.

Quick steps to deploy properly:

1. Create a Vercel project pointing to this repo
2. Ensure the `root` project is this repo's root (default)
3. The `vercel.json` file sets the build and install commands. Specifically it uses `npm ci --include=dev` to ensure `vite` (devDependency) is installed for the build.

If you'd rather keep `vite` in devDependencies but not rely on `installCommand`, alternative approaches are:
- Move `vite` from `devDependencies` into `dependencies` (not advised — causes larger install footprint) OR
- Ensure `NPM_FLAGS` for the Vercel deployment is set to `--include=dev` (project settings > Environment Variables > `NPM_FLAGS` = `--include=dev`).

---

If you want to include the `server/` directory in a separate Vercel project, create a new project with root `server/` in the Vercel dashboard and configure as a Python/Flask app.

