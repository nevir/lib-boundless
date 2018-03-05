#!/usr/bin/env bash
set -e

source ./node_modules/@nevir/code-style/.scripts/include/globbing.sh

if [[ "${#PRETTIER_FILES[@]}" != "0" ]]; then
  ./node_modules/.bin/prettier --write "${PRETTIER_FILES[@]}"
fi

if [[ "${#ESLINT_FILES[@]}" != "0" ]]; then
  ./node_modules/.bin/eslint --fix "${ESLINT_FILES[@]}"
fi
