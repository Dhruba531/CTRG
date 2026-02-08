# Security Checklist

## ⚠️ Before Deploying to Production

### Critical
- [ ] Change SECRET_KEY to a secure random string
- [ ] Move .env credentials to secure secrets manager (AWS Secrets Manager, Azure Key Vault)
- [ ] Switch from SQLite to PostgreSQL
- [ ] Enable HTTPS/SSL (SECURE_SSL_REDIRECT=True)
- [ ] Set DEBUG=False in production
- [ ] Update ALLOWED_HOSTS to actual domain
- [ ] Set SESSION_COOKIE_SECURE=True
- [ ] Set CSRF_COOKIE_SECURE=True
- [ ] Enable HSTS (SECURE_HSTS_SECONDS=31536000)

### Important
- [ ] Implement rate limiting on API endpoints
- [ ] Add CORS restrictions (limit CORS_ALLOWED_ORIGINS)
- [ ] Set up regular backups for database
- [ ] Configure security headers (CSP, X-Frame-Options)
- [ ] Enable database connection pooling
- [ ] Set up Redis for Celery (not local)
- [ ] Configure proper file upload limits
- [ ] Add API authentication throttling
- [ ] Implement audit logging
- [ ] Set up monitoring and alerting

### Recommended
- [ ] Use environment-specific settings files
- [ ] Implement API versioning
- [ ] Add request/response logging
- [ ] Set up automated security scanning
- [ ] Configure WAF rules
- [ ] Implement DDoS protection
- [ ] Add health check endpoints
- [ ] Set up dependency vulnerability scanning
- [ ] Configure log rotation
- [ ] Implement proper error handling (don't expose stack traces)

## Sensitive Files (Never Commit)
- `.env`
- `db.sqlite3`
- `*.key`
- `*.pem`
- Any files with credentials/tokens
