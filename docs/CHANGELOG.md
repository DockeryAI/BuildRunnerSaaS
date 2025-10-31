# BuildRunner Changelog

All notable changes to BuildRunner will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Documentation & Developer Experience (CLI + SDK)
- Typed TypeScript/JavaScript SDK
- Enhanced CLI with shell completion
- Interactive API documentation
- Code snippet generator
- Example verifier CI

## [1.6.0] - 2025-10-31

### Added
- Figma Parity & Design System Sync
- Automated design token synchronization from Figma
- Component registry bridge with drift detection
- Visual regression testing with Playwright
- CLI design sync workflow
- Design system governance policies

### Changed
- Enhanced governance policies with design system requirements
- Updated Tailwind configuration for design tokens
- Improved CI/CD with design parity checks

### Security
- Figma tokens remain server-side only
- Environment variables masked in logs

## [1.5.0] - 2025-10-31

### Added
- Admin Console & Token/Cost Tracking
- Real-time admin dashboard with project metrics
- Cost reconciliation worker with budget enforcement
- Impersonation sessions with full audit trails
- API key management with hashed storage
- Support ticket system with incident center
- Maintenance windows with operation blocking

### Changed
- Enhanced role-based access control
- Improved billing integration with admin operations
- Extended governance with admin policies

### Security
- API keys hashed at rest with bcrypt
- Complete audit logging for admin actions
- Secure impersonation with automatic termination

## [1.4.0] - 2025-10-31

### Added
- Monetization & Billing with Stripe integration
- Four pricing tiers (Free/Pro/Team/Enterprise)
- Usage-based billing with token consumption tracking
- Feature gating with plan-based access control
- Real-time usage monitoring with alerts
- Customer portal integration

### Changed
- Enhanced analytics with cost tracking
- Improved governance with billing policies
- Updated UI with billing dashboard

### Security
- PCI-compliant payment processing
- Encrypted billing data storage
- Audit logging for all billing events

## [1.3.0] - 2025-10-31

### Added
- Integrations with Jira, Linear, and Preview Environments
- Automated ticket synchronization
- Preview environment deployment
- Integration analytics and cost tracking
- Webhook management system

### Changed
- Enhanced project management with external integrations
- Improved analytics with integration metrics
- Updated governance with integration policies

### Security
- Secure credential storage for integrations
- Audit logging for integration activities
- Rate limiting for external API calls

## [1.2.0] - 2025-10-31

### Added
- Enterprise & Compliance features
- VPC deployment support
- SSO integration with SAML/OIDC
- Audit ledger with hash chain verification
- Compliance reporting (SOC2, HIPAA)
- Data retention policies

### Changed
- Enhanced security with enterprise-grade features
- Improved governance with compliance policies
- Updated analytics with audit metrics

### Security
- Immutable audit ledger
- Encrypted data at rest and in transit
- Role-based access control enhancements

## [1.1.0] - 2025-10-31

### Added
- Explainability & Multi-Model support
- AI narrative generation for project insights
- Intelligent model routing based on task complexity
- Model performance analytics
- Cost optimization recommendations

### Changed
- Enhanced analytics with AI insights
- Improved project planning with intelligent suggestions
- Updated governance with AI model policies

### Performance
- Optimized model selection algorithms
- Reduced token consumption through intelligent routing

## [1.0.0] - 2025-10-31

### Added
- Core BuildRunner platform
- Project management and planning
- Flow Inspector with visual analytics
- Governance & Safety Layer with policy DSL
- QA & Acceptance Automation
- Templates & Marketplace
- Analytics & Cost Monitoring
- Collaboration & Comments Integration

### Security
- Authentication and authorization system
- Secure API key management
- Audit logging for all operations

---

## Release Process

### Versioning Strategy

BuildRunner follows semantic versioning:
- **Major** (X.0.0): Breaking changes, major new features
- **Minor** (X.Y.0): New features, backwards compatible
- **Patch** (X.Y.Z): Bug fixes, security patches

### Release Types

- **Alpha**: Early development releases (X.Y.Z-alpha.N)
- **Beta**: Feature-complete pre-releases (X.Y.Z-beta.N)
- **RC**: Release candidates (X.Y.Z-rc.N)
- **Stable**: Production releases (X.Y.Z)

### Changelog Guidelines

When adding entries to this changelog:

1. **Group changes** by type:
   - `Added` for new features
   - `Changed` for changes in existing functionality
   - `Deprecated` for soon-to-be removed features
   - `Removed` for now removed features
   - `Fixed` for any bug fixes
   - `Security` for vulnerability fixes

2. **Be specific** about what changed:
   - ✅ "Added real-time collaboration with presence indicators"
   - ❌ "Improved collaboration"

3. **Include impact** when relevant:
   - Breaking changes should be clearly marked
   - Performance improvements should include metrics
   - Security fixes should mention severity

4. **Link to issues/PRs** when applicable:
   - Use GitHub issue/PR numbers: `#123`
   - Link to documentation: `[docs](https://docs.buildrunner.com)`

### Automated Changelog Generation

Use the changelog generator script:

```bash
# Generate changelog entry for current changes
npm run changelog

# Generate changelog for specific version
npm run changelog -- --version 1.7.0

# Generate changelog with custom template
npm run changelog -- --template release
```

The generator will:
- Analyze git commits since last release
- Group changes by conventional commit types
- Generate markdown in Keep a Changelog format
- Include links to commits and PRs

### Release Checklist

Before creating a release:

- [ ] Update version in `package.json`
- [ ] Update version in `buildrunner/specs/plan.json`
- [ ] Add changelog entry with release date
- [ ] Update documentation if needed
- [ ] Run full test suite
- [ ] Create release PR
- [ ] Tag release after merge
- [ ] Deploy to production
- [ ] Announce release

---

For more information about releases, see our [Release Guide](https://docs.buildrunner.com/releases).
