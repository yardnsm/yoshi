#!/bin/bash
git clean -Xdf -e "!.idea" -e "!*.iml" -e "!*.private.*"
nvm install
npm config set registry http://repo.dev.wix/artifactory/api/npm/npm-repos
npm install
npm run build
npm test
