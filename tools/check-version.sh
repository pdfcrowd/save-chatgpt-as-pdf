#!/bin/bash

set -e

VERSION=`grep -Po '"version":\s+"\K[0-9.]+(?=")' manifest.json`

grep -E "\"version\":\s+\"$VERSION\"" manifest_firefox.json > /dev/null \
    || (echo "VERSION MISMATCH manifest_firefox.json"; false)

grep -E "'v$VERSION'" shared.js > /dev/null \
     || (echo "VERSION MISMATCH: shared.js"; false)

grep -E "@version\s+$VERSION" userscript/save-chatgpt-as-pdf.user.js > /dev/null \
     || (echo "VERSION MISMATCH: save-chatgpt-as-pdf.user.js"; false)

