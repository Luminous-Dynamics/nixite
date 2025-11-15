#!/usr/bin/env bash

# GitHub Labels Setup Script
# Applies labels from .github/labels.json to the repository

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
RESET='\033[0m'

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

LABELS_FILE=".github/labels.json"

echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}GitHub Labels Setup${RESET}"
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo -e "${RED}✗ GitHub CLI (gh) is not installed${RESET}"
  echo -e "${YELLOW}Install it from: https://cli.github.com/${RESET}"
  echo ""
  echo "Installation methods:"
  echo "  - Debian/Ubuntu: sudo apt install gh"
  echo "  - Fedora/RHEL: sudo dnf install gh"
  echo "  - macOS: brew install gh"
  echo "  - NixOS: nix-env -iA nixpkgs.gh"
  exit 1
fi

# Check if labels file exists
if [ ! -f "$LABELS_FILE" ]; then
  echo -e "${RED}✗ Labels file not found: $LABELS_FILE${RESET}"
  exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo -e "${RED}✗ Not a git repository${RESET}"
  exit 1
fi

# Check if gh is authenticated
if ! gh auth status &> /dev/null; then
  echo -e "${YELLOW}⚠ GitHub CLI not authenticated${RESET}"
  echo -e "Run: ${BOLD}gh auth login${RESET}"
  exit 1
fi

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
if [ -z "$REPO" ]; then
  echo -e "${RED}✗ Could not determine repository${RESET}"
  echo -e "Make sure you're in a GitHub repository and have push access"
  exit 1
fi

echo -e "${GREEN}✓ Repository: ${BOLD}$REPO${RESET}"
echo -e "${GREEN}✓ Labels file: ${BOLD}$LABELS_FILE${RESET}\n"

# Count labels
LABEL_COUNT=$(jq '. | length' "$LABELS_FILE")
echo -e "Found ${BOLD}$LABEL_COUNT${RESET} labels to configure\n"

# Ask for confirmation
echo -e "${YELLOW}This will create/update labels in the repository.${RESET}"
echo -e "${YELLOW}Existing labels with the same name will be updated.${RESET}\n"

read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Cancelled${RESET}"
  exit 0
fi

echo ""

# Process each label
SUCCESS=0
FAILED=0
UPDATED=0
CREATED=0

while IFS= read -r label; do
  NAME=$(echo "$label" | jq -r '.name')
  COLOR=$(echo "$label" | jq -r '.color')
  DESCRIPTION=$(echo "$label" | jq -r '.description')

  echo -n "Processing: ${BOLD}$NAME${RESET}... "

  # Check if label exists
  if gh label list --json name --jq ".[].name" | grep -q "^${NAME}$"; then
    # Update existing label
    if gh label edit "$NAME" --color "$COLOR" --description "$DESCRIPTION" &> /dev/null; then
      echo -e "${BLUE}updated${RESET}"
      ((UPDATED++))
      ((SUCCESS++))
    else
      echo -e "${RED}failed to update${RESET}"
      ((FAILED++))
    fi
  else
    # Create new label
    if gh label create "$NAME" --color "$COLOR" --description "$DESCRIPTION" &> /dev/null; then
      echo -e "${GREEN}created${RESET}"
      ((CREATED++))
      ((SUCCESS++))
    else
      echo -e "${RED}failed to create${RESET}"
      ((FAILED++))
    fi
  fi
done < <(jq -c '.[]' "$LABELS_FILE")

# Summary
echo ""
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}Summary${RESET}"
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"

echo -e "  ${GREEN}✓ Created:${RESET}  $CREATED labels"
echo -e "  ${BLUE}✓ Updated:${RESET}  $UPDATED labels"
echo -e "  ${GREEN}✓ Success:${RESET}  $SUCCESS total"

if [ "$FAILED" -gt 0 ]; then
  echo -e "  ${RED}✗ Failed:${RESET}   $FAILED labels"
fi

echo ""

if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✓ All labels configured successfully!${RESET}\n"
else
  echo -e "${YELLOW}⚠ Some labels failed to configure${RESET}\n"
fi

# Show label summary by category
echo -e "${BOLD}Label Categories:${RESET}\n"

echo -e "  ${BOLD}Type:${RESET}       $(jq -r '.[] | select(.name | startswith("type:")) | .name' "$LABELS_FILE" | wc -l) labels"
echo -e "  ${BOLD}Priority:${RESET}   $(jq -r '.[] | select(.name | startswith("priority:")) | .name' "$LABELS_FILE" | wc -l) labels"
echo -e "  ${BOLD}Status:${RESET}     $(jq -r '.[] | select(.name | startswith("status:")) | .name' "$LABELS_FILE" | wc -l) labels"
echo -e "  ${BOLD}Area:${RESET}       $(jq -r '.[] | select(.name | startswith("area:")) | .name' "$LABELS_FILE" | wc -l) labels"
echo -e "  ${BOLD}Other:${RESET}      $(jq -r '.[] | select(.name | startswith("type:") | not) | select(.name | startswith("priority:") | not) | select(.name | startswith("status:") | not) | select(.name | startswith("area:") | not) | .name' "$LABELS_FILE" | wc -l) labels"

echo ""
echo -e "${BOLD}View labels:${RESET} ${BLUE}gh label list${RESET}"
echo -e "${BOLD}Repository:${RESET}  ${BLUE}https://github.com/$REPO/labels${RESET}\n"
