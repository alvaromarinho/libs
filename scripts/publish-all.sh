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
  echo ""
  echo "==> Building $lib"
  npx ng build "$lib"

  echo "==> Publishing $lib"
  (cd "dist/$lib" && npm publish)
done
