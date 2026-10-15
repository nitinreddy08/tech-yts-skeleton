#!/usr/bin/env bash
# Automatic repair of broken price scrapers — plain code, no AI. Run by .github/workflows/refresh-prices.yml
# right after `npm run prices:refresh` has written data/price-health.json.
#
# For every store whose status is "broken" (pages load but no price can be read):
#   1. `npm run prices:heal` looks for where the last known price lives now (lib/prices/discover.ts) and,
#      only if one unambiguous way of reading it works on every saved page, adds it to the store's config
#   2. GATES — all must pass, otherwise the change is thrown away and a GitHub issue is opened:
#        a. prices:guard  – only that store's config changed, nothing loosened
#        b. prices:test   – every store's saved sample pages still extract the expected price
#        c. live refresh  – the store reads real prices again (>0 ok, no longer "broken")
#   3. commit + push to the branch the workflow runs on (falls back to a PR if the branch is protected)
#
# Environment: GH_TOKEN (to open issues / PRs), REPAIR_DRY_RUN=1 (no push / no gh — for local simulation).
set -uo pipefail

DRY="${REPAIR_DRY_RUN:-}"
TARGET_BRANCH="${GITHUB_REF_NAME:-$(git rev-parse --abbrev-ref HEAD)}"
failed=0

alert() { # <store> <message>
  echo "::error title=Price scraper: $1::$2"
  if [ -z "$DRY" ] && command -v gh >/dev/null 2>&1; then
    gh issue create \
      --title "Price scraper: $1 needs attention" \
      --body "The scheduled **Refresh prices** run could not repair the \`$1\` scraper automatically.

**Reason:** $2

The store's page layout changed in a way the automatic healer can't resolve safely. Open \`config/price-scrapers/$1.json\`,
download the run's \`price-fixtures\` artifact, run \`npm run prices:inspect -- <linkId>\` locally to see what each strategy finds,
and update the selectors (then \`npm run prices:test\`).
Run: ${GITHUB_SERVER_URL:-}/${GITHUB_REPOSITORY:-}/actions/runs/${GITHUB_RUN_ID:-}" >/dev/null 2>&1 || true
  fi
}

# Throw away everything the heal or the verification steps changed. Safe because we refuse to start on a
# dirty tree; ignored scratch space (data/price-fixtures) is left for the next store.
revert() {
  git reset -q --hard HEAD
  git clean -fdq
}

publish() { # <store>
  git add config lib/prices/__tests__/fixtures data/prices.json data/price-health.json
  git commit -q \
    -m "scraper($1): auto-heal after layout change" \
    -m "Found by prices:heal; verified by prices:guard, prices:test and a live prices:refresh for $1." || return 1
  [ -n "$DRY" ] && return 0
  if git pull -q --rebase origin "$TARGET_BRANCH" && git push -q origin "HEAD:$TARGET_BRANCH"; then return 0; fi
  git rebase --abort >/dev/null 2>&1 || true
  # Protected branch (or a race): publish as a pull request instead.
  local b="auto/scraper-fix-$1-$(date +%Y%m%d%H%M)"
  git push -q origin "HEAD:refs/heads/$b" &&
    gh pr create --base "$TARGET_BRANCH" --head "$b" \
      --title "scraper($1): auto-heal after layout change" \
      --body "Automatic heal of the \`$1\` scraper. It passed the guard, the offline sample tests and a live refresh. Review and merge."
}

if [ -n "$(git status --porcelain)" ]; then
  echo "::error::Working tree has uncommitted changes; refusing to run the repair (it resets the tree on failure)."
  git status --short
  exit 2
fi

stores="$(npm run -s prices:broken)"
if [ -z "$stores" ]; then
  echo "No broken stores — nothing to repair."
  exit 0
fi

for store in $stores; do
  echo "::group::Heal $store"

  if ! npm run -s prices:heal -- --store "$store"; then
    alert "$store" "the automatic healer found no single, unambiguous way to read the price on the saved pages."
    revert; failed=1; echo "::endgroup::"; continue
  fi
  if ! npm run -s prices:guard; then
    alert "$store" "the healed config was rejected by the safety guard (see the run log)."
    revert; failed=1; echo "::endgroup::"; continue
  fi
  if ! npm run -s prices:test; then
    alert "$store" "the healed config breaks the offline sample tests."
    revert; failed=1; echo "::endgroup::"; continue
  fi
  if ! npm run -s prices:refresh -- --store "$store" ||
     ! node -e "const h=require('./data/price-health.json').stores['$store']; process.exit(h && h.ok>0 && h.status!=='broken' ? 0 : 1)"; then
    alert "$store" "after the heal the live refresh still cannot read real prices for this store."
    revert; failed=1; echo "::endgroup::"; continue
  fi

  if publish "$store"; then
    echo "Healed and published $store."
  else
    alert "$store" "the heal passed all checks but could not be pushed."
    failed=1
  fi
  echo "::endgroup::"
done

exit "$failed"
