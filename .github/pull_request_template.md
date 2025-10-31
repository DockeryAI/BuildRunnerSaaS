# BuildRunner PR Template

## ⚠️ REQUIRED: Microstep ID
**Microstep ID(s):** <!-- e.g., p4.s2.ms1, p4.s2.ms2 -->

> **BLOCKING WARNING**: PRs without valid microstep IDs will be rejected. 
> Each commit must reference a microstep from /buildrunner/specs/plan.json

## Summary
Brief description of changes made.

## Microstep Details
- [ ] **Microstep ID**: [ID from plan.json]
- [ ] **Title**: [Microstep title]
- [ ] **Acceptance Criteria**:
  - [ ] [Criterion 1]
  - [ ] [Criterion 2]
  - [ ] [Criterion 3]

## Risk Assessment
**Risk Level:** <!-- Select one: low | medium | high | critical -->

### Rollback Plan (Required for medium/high/critical risk)
<!-- Describe how to rollback these changes if issues arise -->
```
1.
2.
3.
```

### Post-Check Verification (Required for high/critical risk)
<!-- Describe verification steps to confirm the change works correctly in production -->
- [ ] Health check endpoint responds correctly
- [ ] Key user workflows function as expected
- [ ] Database migrations applied successfully
- [ ] No error spikes in monitoring
- [ ] Performance metrics within acceptable range

## Changes Made
- [ ] Files added/modified
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Build spec updated (if applicable)

## Testing
- [ ] Local testing completed
- [ ] All acceptance criteria verified
- [ ] No breaking changes introduced

## Governance Compliance
- [ ] Commit messages include microstep IDs
- [ ] No secrets exposed in client code
- [ ] Build spec kept in sync with implementation
- [ ] Change history updated (if plan.json modified)

## Additional Notes
Any additional context, screenshots, or deployment notes.
