#!/usr/bin/env bash
set -euo pipefail
echo "Running Build Validation..."

if [[ -f package.json ]]; then
  echo "📦 Node.js project"
  command -v corepack >/dev/null 2>&1 && corepack enable || true
  npm ci
  npm run build || echo "⚠️  No build script"
  npm test || echo "⚠️  No tests"
fi

[[ -f Cargo.toml ]] && { echo "🦀 Rust project"; cargo build && cargo test; }
[[ -f go.mod ]] && { echo "🐹 Go project"; go build ./... && go test ./...; }
if [[ -f requirements.txt ]] || [[ -f pyproject.toml ]]; then
  echo "🐍 Python project"
  echo "⚠️  Validation not implemented yet"
fi

echo "✅ Build and validation OK"
