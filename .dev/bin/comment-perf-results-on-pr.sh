#!/usr/bin/env bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

success() {
  echo -e "${GREEN}Success:${NC} $1"
}

error() {
  echo -e "${RED}Error:${NC} $1"
}

PR_URL=${CIRCLE_PULL_REQUEST}
PR_ID=${PR_URL##*/}

if [[ -z "${GH_AUTH_TOKEN}" ]]; then
  error "GH_AUTH_TOKEN is not set"
  exit 1
fi

# If this is not a pull request, no need to execute the script
if [[ -z "$PR_ID" ]]; then
  exit 0
fi

GH_LOGIN=$(curl -sS -H "Authorization: token $GH_AUTH_TOKEN" https://api.github.com/user | jq '.login' --raw-output)
success "Successfully authenticated with $GH_LOGIN"

git config github.user $GH_LOGIN

success "Pull Request ID: $PR_ID"

PERF_TEST_RESULTS=$(cat ~/project/post-editor-performance-results.txt)

BOT_COMMENTS=$(curl -sS \
  -u $GH_LOGIN:$GH_AUTH_TOKEN \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME/issues/$PR_ID/comments")

COMMENT=$(echo $BOT_COMMENTS | jq '[.[] | select( .user.login == "godaddy-wordpress-bot" and ( .body | contains( "Performance Test Results" ) ) )]' | jq '.[-1]')

# Bot has not commented on the issue, create new comment
if [ 'null' == "$COMMENT" ]; then
  success "Posting new comment."
  NEW_COMMENT=$(curl -sS \
    -X POST \
    -u $GH_LOGIN:$GH_AUTH_TOKEN \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME/issues/$PR_ID/comments" \
    -d '{"body": "Performance Test Results: <br />'"$PERF_TEST_RESULTS"'"}')
  success "Done."
fi

success "Updating existing comment."

COMMENT_ID=$(echo $COMMENT | jq '.id');

if [ -z "$COMMENT_ID" ]; then
  error "Comment ID not found."
  exit 1
fi

NEW_COMMENT=$(curl -sS \
  -X PATCH \
  -u $GH_LOGIN:$GH_AUTH_TOKEN \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME/issues/comments/$COMMENT_ID" \
  -d '{"body": "Performance Test Results: <br />'"$PERF_TEST_RESULTS"'"}')

success "Done."
