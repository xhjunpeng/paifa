#!/bin/sh
set -eu

PAIFA_SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
exec node "$PAIFA_SCRIPT_DIR/install.mjs" "$@"
