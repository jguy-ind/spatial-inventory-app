#!/usr/bin/env bash
# Preview the site locally: loads Node/npm from nvm or PATH, installs deps if needed, runs dev server.
set -e
cd "$(dirname "$0")/.."

# Load nvm if present (so node/npm are on PATH)
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  . "$HOME/.nvm/nvm.sh"
elif [ -s "/usr/local/opt/nvm/nvm.sh" ]; then
  . "/usr/local/opt/nvm/nvm.sh"
fi

# Prefer npm from common locations if not in PATH
if ! command -v npm >/dev/null 2>&1; then
  export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Node/npm not found. Install Node (e.g. from https://nodejs.org) or run: nvm install"
  exit 1
fi

[ ! -d node_modules ] && echo "Installing dependencies..." && npm install
echo "Starting dev server at http://localhost:3000"
exec npm run dev
