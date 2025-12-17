#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

FILES_WITH_VERSION=(
    "manifest_chrome.json"
    "manifest_firefox.json"
    "shared.js"
    "userscript/save-chatgpt-as-pdf.user.js"
)

show_help() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS] [VERSION]

Bump version across all project files.

Arguments:
    VERSION         New version number (e.g., 3.6)
                    If not provided, auto-increments minor version.

Options:
    --major         Bump major version (X.0)
    --minor         Bump minor version (x.Y) [default]
    --patch         Bump patch version (x.y.Z)
    --dry-run       Show changes without applying them
    --current       Show current version and exit
    -h, --help      Show this help message

Examples:
    $(basename "$0")              # Auto-bump minor: 3.5 -> 3.6
    $(basename "$0") 4.0          # Set specific version
    $(basename "$0") --major      # Bump major: 3.5 -> 4.0
    $(basename "$0") --dry-run    # Preview changes

Files updated:
    - manifest_chrome.json
    - manifest_firefox.json
    - shared.js
    - userscript/save-chatgpt-as-pdf.user.js
    - HISTORY (adds new section)
EOF
}

get_current_version() {
    grep -oP '"version":\s*"\K[0-9.]+' "$PROJECT_ROOT/manifest_chrome.json" \
        | head -1
}

bump_version() {
    local current="$1"
    local bump_type="$2"

    local major minor patch
    IFS='.' read -r major minor patch <<< "$current"
    patch="${patch:-0}"

    case "$bump_type" in
        major)
            echo "$((major + 1)).0"
            ;;
        minor)
            echo "$major.$((minor + 1))"
            ;;
        patch)
            echo "$major.$minor.$((patch + 1))"
            ;;
    esac
}

update_file() {
    local file="$1"
    local old_version="$2"
    local new_version="$3"
    local dry_run="$4"
    local filepath="$PROJECT_ROOT/$file"

    if [[ ! -f "$filepath" ]]; then
        echo "Warning: $file not found, skipping"
        return
    fi

    local changes=""

    case "$file" in
        manifest_*.json)
            changes=$(sed -n \
                "s/\"version\": \"$old_version\"/\"version\": \"$new_version\"/p" \
                "$filepath")
            if [[ -z "$dry_run" ]]; then
                sed -i \
                    "s/\"version\": \"$old_version\"/\"version\": \"$new_version\"/" \
                    "$filepath"
            fi
            ;;
        shared.js)
            changes=$(sed -n \
                "s/version = 'v$old_version'/version = 'v$new_version'/p" \
                "$filepath")
            if [[ -z "$dry_run" ]]; then
                sed -i \
                    "s/version = 'v$old_version'/version = 'v$new_version'/" \
                    "$filepath"
            fi
            ;;
        userscript/*.js)
            changes=$(sed -n \
                "s/@version[[:space:]]*$old_version/@version      $new_version/p" \
                "$filepath")
            if [[ -z "$dry_run" ]]; then
                sed -i \
                    "s/@version[[:space:]]*$old_version/@version      $new_version/" \
                    "$filepath"
            fi
            ;;
    esac

    if [[ -n "$changes" ]]; then
        echo "  $file"
    fi
}

prompt_changelog() {
    local entries=()

    echo "" >&2
    echo "Enter changelog entries (one per line, empty line to finish):" >&2
    echo "  Prefix with: Added, Changed, Fixed, Improved, Removed" >&2
    echo "" >&2

    while true; do
        read -r -p "- " entry
        if [[ -z "$entry" ]]; then
            break
        fi
        entries+=("$entry")
    done

    if [[ ${#entries[@]} -eq 0 ]]; then
        echo "No entries provided, using placeholder" >&2
        entries+=("TODO: Add changelog entry")
    fi

    printf '%s\n' "${entries[@]}"
}

update_history() {
    local new_version="$1"
    local dry_run="$2"
    local filepath="$PROJECT_ROOT/HISTORY"
    shift 2
    local entries=("$@")

    if [[ ! -f "$filepath" ]]; then
        echo "Warning: HISTORY not found, skipping"
        return
    fi

    # Check if version already exists in HISTORY
    if grep -q "^Changes in $new_version" "$filepath"; then
        echo "  HISTORY (version $new_version already exists)"
        return
    fi

    echo "  HISTORY (adding new section)"

    if [[ -z "$dry_run" ]]; then
        local temp_file
        temp_file=$(mktemp)
        {
            echo "Changes in $new_version"
            for entry in "${entries[@]}"; do
                echo "- $entry"
            done
            echo ""
            cat "$filepath"
        } > "$temp_file"
        mv "$temp_file" "$filepath"
    fi
}

main() {
    local new_version=""
    local bump_type="minor"
    local dry_run=""
    local show_current=""

    while [[ $# -gt 0 ]]; do
        case "$1" in
            -h|--help)
                show_help
                exit 0
                ;;
            --major)
                bump_type="major"
                shift
                ;;
            --minor)
                bump_type="minor"
                shift
                ;;
            --patch)
                bump_type="patch"
                shift
                ;;
            --dry-run)
                dry_run="1"
                shift
                ;;
            --current)
                show_current="1"
                shift
                ;;
            -*)
                echo "Error: Unknown option: $1" >&2
                echo "Use --help for usage information" >&2
                exit 1
                ;;
            *)
                new_version="$1"
                shift
                ;;
        esac
    done

    local current_version
    current_version=$(get_current_version)

    if [[ -n "$show_current" ]]; then
        echo "$current_version"
        exit 0
    fi

    if [[ -z "$current_version" ]]; then
        echo "Error: Could not detect current version" >&2
        exit 1
    fi

    if [[ -z "$new_version" ]]; then
        new_version=$(bump_version "$current_version" "$bump_type")
    fi

    if [[ "$current_version" == "$new_version" ]]; then
        echo "Version is already $current_version"
        exit 0
    fi

    if [[ -n "$dry_run" ]]; then
        echo "Dry run: $current_version -> $new_version"
        echo "Would update:"
        echo "  (You will be prompted for changelog entries)"
    else
        echo "Bumping version: $current_version -> $new_version"
        echo "Updating:"
    fi

    for file in "${FILES_WITH_VERSION[@]}"; do
        update_file "$file" "$current_version" "$new_version" "$dry_run"
    done

    # Prompt for changelog entries (skip in dry-run mode)
    local changelog_entries=()
    if [[ -z "$dry_run" ]]; then
        mapfile -t changelog_entries < <(prompt_changelog)
        echo ""
    fi

    update_history "$new_version" "$dry_run" "${changelog_entries[@]}"

    if [[ -z "$dry_run" ]]; then
        echo ""
        echo "Done! You can now commit:"
        echo "  git add -A && git commit -m 'Bump version to $new_version'"
    fi
}

main "$@"
