#!/usr/bin/env bash
set -e

source ./node_modules/@nevir/code-style/.scripts/include/globbing.sh

if [[ "${#TYPESCRIPT_FILES[@]}" != "0" || "${#FILES[@]}" == "0" ]]; then
  ./node_modules/.bin/tsc --noEmit "${TYPESCRIPT_FILES[@]}"
fi

if [[ "${#ESLINT_FILES[@]}" != "0" ]]; then
  ./node_modules/.bin/eslint "${ESLINT_FILES[@]}"
fi

if [[ "${#PRETTIER_FILES[@]}" != "0" ]]; then
  set +e
  UGLY_FILES=($(
    ./node_modules/.bin/prettier --list-different "${PRETTIER_FILES[@]}"
  ))
  set -e
  if [[ "${#UGLY_FILES[@]}" != "0" ]]; then
    echo
    echo -e "\033[4m\033[33mThe following files are not well formatted:\033[0m"
    echo
    for file in "${UGLY_FILES[@]}"; do
      echo "  ${file}"
    done
    echo
    echo -e "\033[31mPlease fix via: \033[33mnpm run fix-style\033[0m"
    echo
    exit 1
  fi
fi
