# Logging Branch Workflow

Production code stays clean. Logging lives in a separate branch that you
can cherry-pick when debugging.

## Setup (One Time)

Create the logging branch from current state:

```bash
git checkout -b feature/verbose-logging
```

Add all the console.log statements for debugging:
- Request chunking progress
- Compression stats
- Session management
- API calls

Commit the logging:
```bash
git add request.js background.js
git commit -m "Add verbose logging for debugging"
```

Push the branch:
```bash
git push -u origin feature/verbose-logging
```

## Daily Workflow

### Working on Production (Normal Development)

```bash
git checkout master
# ... make changes ...
git commit -m "Your feature/fix"
```

Production code has no console.log spam.

### Need Debugging Logs?

Cherry-pick the logging commit into your current branch:

```bash
# Get the logging commit SHA (one time lookup)
git log feature/verbose-logging --oneline | head -1

# Cherry-pick into current branch
git cherry-pick <logging-commit-sha>

# Now you have logs, do your debugging
# Test, investigate, etc.
```

### Done Debugging?

```bash
# Drop the logging commit
git reset --hard HEAD~1

# Or if you made other commits:
git rebase -i HEAD~5  # Choose number of commits
# Mark the logging commit as "drop"
```

## Updating the Logging Branch

If you add new features that need new logs:

```bash
git checkout feature/verbose-logging
git rebase master  # Update to latest code

# Add new logs
# Edit request.js, background.js, etc.

git add .
git commit --amend  # Add to existing logging commit
git push -f origin feature/verbose-logging
```

## Alternative: Interactive Rebase

```bash
# While on feature branch with logging
git rebase -i master

# In editor, move logging commit to top
# Save and exit

# Now logging is first commit, easy to drop:
git reset --hard HEAD~1
```

## Tips

- Keep logging commit simple (one commit, easy to cherry-pick)
- Don't mix logging with feature code
- Logging branch should always be based on latest master
- Can have multiple logging branches (verbose-requests, verbose-compression)

## Example Session

```bash
# Start work
git checkout master
git pull

# Need logs for debugging
git cherry-pick abc1234  # logging commit

# Debug, find issue
# ...

# Fix the issue (new commit)
git add common.js
git commit -m "Fix chunk boundary issue"

# Remove logging before pushing
git rebase -i HEAD~2
# Mark logging commit as "drop"

# Push clean code
git push origin master
```
