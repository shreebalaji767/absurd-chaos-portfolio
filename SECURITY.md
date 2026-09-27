# Security Policy

## Scope

This project is a static procedural website.

There is no application backend, database, authentication system, or server-side
user data store.

## Supported versions

The latest version on the default branch is the supported version.

## Reporting a vulnerability

If you discover a security problem in this project:

1. Do not publicly disclose the vulnerability before it can be reviewed.
2. Open a private security report through the repository's available security
   reporting mechanism.
3. Include:
   - affected file
   - affected version
   - reproduction steps
   - expected behavior
   - actual behavior
   - potential impact

## Privacy

The website does not intentionally collect or persist personal information.

The procedural runtime uses browser memory only.

The project does not intentionally use:

- localStorage
- sessionStorage
- IndexedDB
- cookies
- application databases

## Third-party services

The application itself does not require an external runtime API.

Hosting providers may have their own infrastructure, logging, and privacy
policies. Review the policies of the hosting provider you choose.

## Safe development

Before deploying modifications:

```bash
python generate.py
