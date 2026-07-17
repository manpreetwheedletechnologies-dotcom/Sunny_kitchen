import { join, resolve } from "path";

/**
 * Resolves the ONE fixed folder where uploaded product photos live.
 *
 * Why not `process.cwd()`?
 * `process.cwd()` is the directory the Node process happened to be
 * *launched from* — not a fixed location. With PM2/systemd, that can
 * silently change (a server reboot triggering `pm2 resurrect`, a crash
 * restart, running the start command from a different shell/cron context,
 * etc). When it changes, the app starts looking in a brand-new empty
 * folder for images that are still sitting on disk in the *old* folder —
 * every existing product photo starts 404ing even though nothing was
 * deleted and no redeploy happened.
 *
 * Fix: resolve an absolute path once, based on either an explicit
 * UPLOADS_DIR env var (recommended for production — point it at a folder
 * OUTSIDE the git repo, e.g. /var/www/sunnyskitchen-uploads, so `git pull`
 * / `git clean` / re-cloning the repo can never touch it) or, as a
 * fallback, a location fixed relative to this compiled file (__dirname),
 * which does NOT depend on the process's working directory.
 */
export function getUploadsRootDir(): string {
  if (process.env.UPLOADS_DIR && process.env.UPLOADS_DIR.trim() !== "") {
    return resolve(process.env.UPLOADS_DIR.trim());
  }
  // Fallback: <project-root>/uploads, resolved from this file's own
  // location (dist/uploads-path.js at runtime) rather than from cwd.
  return resolve(join(__dirname, "..", "uploads"));
}

export function getProductsUploadsDir(): string {
  return join(getUploadsRootDir(), "products");
}
