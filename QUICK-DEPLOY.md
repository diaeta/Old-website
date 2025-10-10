# Quick Deployment Guide

## Step 1: Add GitHub Secrets

Go to: https://github.com/diaeta/Old-website/settings/secrets/actions

Add these 4 secrets:
- FTP_SERVER (e.g., ftp.diaeta.be)
- FTP_USERNAME (your FTP username)
- FTP_PASSWORD (your FTP password)
- FTP_SERVER_DIR (e.g., /public_html/ or /www/)

## Step 2: Deploy

```bash
git add -A
git commit -m "Your message"
git push origin master
```

Done! Check deployment at: https://github.com/diaeta/Old-website/actions
