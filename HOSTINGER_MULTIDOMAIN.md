# Hostinger Multi-Domain Setup Guide

## 🌐 Multi-Domain with Hostinger

Hostinger supports multi-domain deployment through two methods:

### Method 1: Separate Hosting Accounts (Recommended)

**For each domain, create a separate Hostinger hosting account:**

1. **Purchase hosting plans** for each domain:
   - luxtronics.com → Business Web Hosting
   - luxtronics.com.au → Business Web Hosting
   - luxtronics.co.nz → Business Web Hosting

2. **Configure FTP credentials** in `.env.local`:
```env
# US Domain
FTP_HOST_US=ftp.luxtronics.com
FTP_USER_US=u123456789
FTP_PASS_US=your_password_here
FTP_REMOTE_DIR_US=/public_html

# Australian Domain
FTP_HOST_AU=ftp.luxtronics.com.au
FTP_USER_AU=u987654321
FTP_PASS_AU=your_password_here
FTP_REMOTE_DIR_AU=/public_html

# New Zealand Domain
FTP_HOST_NZ=ftp.luxtronics.co.nz
FTP_USER_NZ=u112233445
FTP_PASS_NZ=your_password_here
FTP_REMOTE_DIR_NZ=/public_html
```

3. **Deploy to each domain**:
```bash
./scripts/deploy-multidomain.sh luxtronics.com.au hostinger
./scripts/deploy-multidomain.sh luxtronics.co.nz hostinger
```

### Method 2: Addon Domains (Cost Effective)

**Use one hosting account with addon domains:**

1. **Purchase one Business Web Hosting plan** for main domain (luxtronics.com)

2. **Add addon domains** in Hostinger hPanel:
   - Go to **Hosting → Manage → Addon Domains**
   - Add: luxtronics.com.au, luxtronics.co.nz, luxtronics.in
   - Each gets its own directory: `/public_html/au`, `/public_html/nz`, etc.

3. **Configure FTP credentials** in `.env.local`:
```env
# Single Hostinger account with addon domains
FTP_HOST=ftp.luxtronics.com
FTP_USER=u123456789
FTP_PASS=your_password_here

# Different remote directories for each domain
FTP_REMOTE_DIR_US=/public_html
FTP_REMOTE_DIR_AU=/public_html/au
FTP_REMOTE_DIR_NZ=/public_html/nz
FTP_REMOTE_DIR_IN=/public_html/in
```

4. **Deploy to addon domains**:
```bash
./scripts/deploy-multidomain.sh luxtronics.com.au hostinger
./scripts/deploy-multidomain.sh luxtronics.co.nz hostinger
```

## 🔧 Domain Configuration

**Point each domain to Hostinger:**
1. **DNS Settings**: Point domains to Hostinger nameservers
2. **SSL Certificates**: Hostinger provides free SSL for all domains
3. **Domain Detection**: Frontend automatically detects domain for currency

## 🚀 Deployment Commands

```bash
# Deploy to Hostinger (specify platform)
./scripts/deploy-multidomain.sh luxtronics.com.au hostinger
./scripts/deploy-multidomain.sh luxtronics.co.nz hostinger
./scripts/deploy-multidomain.sh luxtronics.in hostinger

# Deploy to Vercel (if using hybrid setup)
./scripts/deploy-multidomain.sh luxtronics.com.au vercel
```

## 💰 Cost Comparison

| Method | Cost | Setup Complexity | Performance |
|--------|------|------------------|-------------|
| Separate Accounts | $$$ | Easy | Best |
| Addon Domains | $$ | Medium | Good |
| Vercel | $$ | Easy | Excellent |

## ✅ Testing

**Test each domain after deployment:**
- Visit `https://luxtronics.com.au` → Should show AUD
- Visit `https://luxtronics.co.nz` → Should show NZD
- Visit `https://luxtronics.in` → Should show INR

**Test currency switching:**
- Manual currency selection should work on all domains
- Domain detection should override IP geolocation