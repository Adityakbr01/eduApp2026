# 🔒 Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in this project, please report it by creating a private security advisory on GitHub or by emailing the maintainers directly. **Please do not create public issues for security vulnerabilities.**

## Security Best Practices

### Environment Variables & Secrets Management

1. **Never commit sensitive data** to the repository:
   - API keys
   - Secret keys
   - Passwords
   - Database connection strings with credentials
   - AWS access keys
   - OAuth tokens

2. **Use `.env` files** for local development:
   - Copy `.env.example` files from respective directories
   - Rename to `.env` and fill in your actual values
   - These files are excluded via `.gitignore`

3. **Generate secure secrets**:

   ```bash
   # Generate a secure random secret (64 bytes)
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. **Production secrets management**:
   - Use environment variables on your hosting platform
   - For Docker: Use `env_file` in docker-compose (stored outside repository)
   - For AWS: Use AWS Secrets Manager or Parameter Store
   - For Vercel/Netlify: Use platform's environment variables UI

### Protected Files

The following patterns are excluded from version control via `.gitignore`:

- `.env`
- `.env.*` (except `.env.example`)
- `infrastructure/*.tfstate`
- `infrastructure/terraform.tfvars`

### GitHub Secrets

For CI/CD workflows, the following secrets are configured as GitHub Secrets:

- `DOCKER_USER` - Docker Hub username
- `DOCKER_PASS` - Docker Hub access token

These are **never** exposed in workflow logs or repository files.

## Secure Development Guidelines

### 1. Authentication & Authorization

- JWT tokens are used for authentication
- Tokens have expiration times (Access: 15m, Refresh: 7d)
- Passwords are hashed using bcryptjs before storage
- RBAC (Role-Based Access Control) is implemented

### 2. API Security

- Rate limiting is enabled to prevent abuse
- CORS is configured to restrict origin access
- Helmet.js is used for security headers
- Input validation using Zod schemas
- XSS and HPP protection enabled

### 3. Database Security

- MongoDB connections use authentication
- Prepared statements prevent SQL injection (N/A for MongoDB)
- Mongoose schema validation

### 4. File Upload Security

- File type validation
- File size limits (100MB max)
- Files stored in AWS S3 with proper access controls
- Cloudinary for image uploads with restrictions

### 5. Payment Security

- Razorpay webhook signature verification
- Never expose secret keys in frontend
- Only public key IDs in client-side code

## Security Checklist for Deployment

- [ ] All environment variables set on production server
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Database access restricted to application servers only
- [ ] Redis secured with password (if exposed)
- [ ] AWS S3 buckets have proper CORS policies
- [ ] Rate limiting configured appropriately
- [ ] Security headers enabled via Helmet.js
- [ ] Regular dependency updates (`npm audit`)
- [ ] No exposed debug endpoints in production
- [ ] Application monitoring and logging enabled

## Dependency Security

Run security audits regularly:

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Check for outdated packages
npm outdated
```

## Contact

For security concerns, please contact the repository maintainers.

---

**Last Updated:** 2026-02-11

test
