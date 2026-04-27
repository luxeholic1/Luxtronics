# Luxtronics Jenkins CI/CD Setup Guide

## Overview

```
Git Push → GitHub Webhook → Jenkins → Build → FTP Deploy → Hostinger Live 🚀
```

Every time you push to `main`, Jenkins automatically builds and deploys — no manual uploads needed.

---

## Step 1: Prerequisites

### A. Install Jenkins
You need a machine (VPS, local server, or cloud VM) that runs 24/7.

**Option 1: Your own Linux VPS (recommended)**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y openjdk-17-jdk
wget -q -O - https://pkg.jenkins.io/debian/jenkins.io-2023.key | sudo apt-key add -
sudo sh -c 'echo deb http://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt update && sudo apt install -y jenkins
sudo systemctl start jenkins && sudo systemctl enable jenkins
# Jenkins runs at http://YOUR_SERVER_IP:8080
```

**Option 2: Docker (quickest)**
```bash
docker run -d -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  --name jenkins jenkins/jenkins:lts
```

### B. Install `lftp` on the Jenkins server
```bash
# Ubuntu/Debian
sudo apt install -y lftp

# CentOS/RHEL
sudo yum install -y lftp
```

---

## Step 2: Jenkins Plugins

Go to **Manage Jenkins → Plugins → Available** and install:

| Plugin | Purpose |
|--------|---------|
| **NodeJS Plugin** | Manage Node.js versions |
| **Git Plugin** | Clone from GitHub/GitLab |
| **GitHub Plugin** | Webhook integration |
| **Credentials Binding Plugin** | Secure secrets injection |
| **Blue Ocean** (optional) | Modern pipeline UI |

---

## Step 3: Configure Node.js

1. Go to **Manage Jenkins → Tools → NodeJS installations**
2. Click **Add NodeJS**
3. Name: `nodejs-20`
4. Version: `NodeJS 20.x`
5. Save

---

## Step 4: Add Credentials (Secrets)

Go to **Manage Jenkins → Credentials → System → Global → Add Credentials**

Add these 4 credentials (all as **Secret text** type):

| Credential ID | Value | Where to find |
|--------------|-------|---------------|
| `HOSTINGER_FTP_HOST` | `ftp.yourdomain.com` | Hostinger → Hosting → FTP Accounts |
| `HOSTINGER_FTP_USER` | `u123456789` | Hostinger → Hosting → FTP Accounts |
| `HOSTINGER_FTP_PASS` | your FTP password | Hostinger → Hosting → FTP Accounts |
| `HOSTINGER_FTP_REMOTE_DIR` | `/public_html` | Your site root on Hostinger |

> **How to find FTP details on Hostinger:**
> hPanel → Hosting → your plan → FTP Accounts

---

## Step 5: Create Jenkins Pipeline Job

1. Click **New Item** → name it `Luxtronics` → select **Pipeline** → OK
2. Under **General**:
   - ✅ GitHub project: `https://github.com/YOUR_ORG/Luxtronics`
3. Under **Build Triggers**:
   - ✅ GitHub hook trigger for GITScm polling
4. Under **Pipeline**:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `https://github.com/YOUR_ORG/Luxtronics.git`
   - Credentials: Add your GitHub credentials
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
5. Click **Save**

---

## Step 6: Set Up GitHub Webhook

> This makes Jenkins trigger automatically on every push (no polling needed).

1. Go to your GitHub repo → **Settings → Webhooks → Add webhook**
2. Payload URL: `http://YOUR_JENKINS_SERVER:8080/github-webhook/`
3. Content type: `application/json`
4. Events: **Just the push event**
5. ✅ Active → **Add webhook**

In Jenkins job → **Configure → Build Triggers** → ✅ **GitHub hook trigger for GITScm polling**

---

## Step 7: Test the Pipeline

```bash
# Make a small change and push
git add .
git commit -m "test: trigger CI/CD pipeline"
git push origin main
```

Watch Jenkins dashboard — a build should trigger within seconds!

---

## Pipeline Stages

```
📥 Checkout  →  ⚙️ Setup Node  →  📦 Install  →  🔍 Lint  →  🏗️ Build  →  🚀 Deploy
```

| Stage | What it does |
|-------|-------------|
| Checkout | Clones latest code from Git |
| Setup Node | Activates Node.js 20 |
| Install | `npm ci` (clean, reproducible) |
| Lint | `npm run lint` (warns only, doesn't block) |
| Build | `npm run build` → outputs to `build/` |
| Deploy | `lftp` mirror to Hostinger via FTP |

> **Note:** Deploy only runs on `main` or `master` branch. Feature branches only build — they don't deploy.

---

## Manual Deploy (Alternative)

If you want to deploy manually without Jenkins:

```bash
# Add to .env.local:
FTP_HOST=ftp.yourdomain.com
FTP_USER=u123456789
FTP_PASS=yourpassword
FTP_REMOTE_DIR=/public_html

# Then run:
npm run build
bash scripts/deploy.sh
```

---

## npm Scripts

Add these to `package.json` for convenience:

```json
"scripts": {
  "deploy": "npm run build && bash scripts/deploy.sh",
}
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `lftp: command not found` | `sudo apt install lftp` on Jenkins server |
| FTP connection refused | Enable FTP in Hostinger hPanel, check firewall |
| Build fails on lint | Fix ESLint errors or remove `--max-warnings=0` flag |
| Webhook not triggering | Check Jenkins server is publicly accessible (not localhost) |
| Old files not removed | `--delete` flag in lftp mirror handles this |
| Large files slow upload | lftp is incremental — only changed files re-upload |

---

## Security Notes

- ✅ FTP credentials stored in Jenkins Credential Manager (encrypted, never in code)
- ✅ `.env.local` is in `.gitignore` — never committed
- ✅ Source maps excluded from deploy (`*.map` excluded)
- ✅ Build artifacts archived in Jenkins for rollback

---

## Quick Reference

```
Jenkins URL:    http://YOUR_SERVER:8080
Pipeline file:  Jenkinsfile  (project root)
Deploy script:  scripts/deploy.sh
Build output:   build/
```
