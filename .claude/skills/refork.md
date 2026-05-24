---
name: refork
description: Pull latest from upstream's redesign-marvin branch and push to the fork's redesign-marvin2 branch
user_invocable: true
---

# Refork: Sync upstream → fork

Pull the latest changes from the original repo (`upstream/redesign-marvin`) into the fork's `redesign-marvin2` branch and push.

## Steps

1. Ensure the `upstream` remote exists pointing to `advo-ph/fourlinq`. If not, add it:
   ```
   git remote add upstream https://github.com/advo-ph/fourlinq.git
   ```

2. Fetch the latest from upstream:
   ```
   git fetch upstream redesign-marvin
   ```

3. Check out `redesign-marvin2`:
   ```
   git checkout redesign-marvin2
   ```

4. Merge upstream into the local branch:
   ```
   git merge upstream/redesign-marvin --no-edit
   ```

5. Push to the fork:
   ```
   git push origin redesign-marvin2
   ```

6. Restart the dev server on port 3000:
   ```
   lsof -ti:3000 | xargs kill -9
   npx vite --port 3000 &
   ```
   Verify the server is running by checking `lsof -ti:3000`.

7. Report what changed (number of commits, files affected) and confirm the dev server is live.
