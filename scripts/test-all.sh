#!/usr/bin/env bash
set -e

LIBS=(
  ng-bs-calendar
  ng-bs-modal-service
  ng-bs-pagination
  ng-bs-toast-service
  ng-collapse
  ng-dd-file
  ng-generate-table
  ng-month-year-picker
)

for lib in "${LIBS[@]}"; do
  local_version=$(node -p "require('./projects/$lib/package.json').version")
  published_version=$(npm view "$lib" version 2>/dev/null || echo "")

  if [ "$local_version" == "$published_version" ]; then
    echo ""
    echo "==> Skipping $lib (version $local_version already published, unchanged)"
    continue
  fi

  echo ""
  echo "==> Testing $lib ($published_version -> $local_version)"
  npx ng test "$lib" --watch=false
done
