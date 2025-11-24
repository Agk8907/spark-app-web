# 💾 Storage Configuration Guide

## 🚀 Automatic Storage Detection (New!)

The SocialFeedApp now **automatically detects** the best storage mode:

1. **If Cloudinary credentials are present** → Uses **Cloud Storage** (Production)
2. **If credentials are missing** → Uses **Local Disk Storage** (Development)

You no longer need to manually set `STORAGE_MODE` unless you want to force a specific mode.

---

## 🔧 Development Mode (Local Storage)

**Default behavior** when no Cloudinary credentials are set.

- Files stored in `server/uploads/` folder
- No configuration needed
- Fast for local development

## ☁️ Production Mode (Cloudinary)

**Automatically activated** when you set these environment variables:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

- Files uploaded to Cloudinary cloud
- CDN delivery for fast loading
- Production-ready

---

## Manual Override (Optional)

If you want to force a specific mode regardless of credentials, you can still use `STORAGE_MODE`:

```bash
# Force local storage even if credentials exist
STORAGE_MODE=local

# Force cloud storage (will error if credentials missing)
STORAGE_MODE=cloud
```

---

## Deployment Guide

When deploying to Heroku, Railway, Render, etc.:

1. **Just add your Cloudinary environment variables** in the platform dashboard.
2. **That's it!** The app will automatically switch to cloud storage.

No need to set `STORAGE_MODE` explicitly anymore.

---

## Summary

| Scenario             | Resulting Mode              |
| -------------------- | --------------------------- |
| No credentials       | **Local Storage** (Default) |
| Credentials present  | **Cloud Storage** (Auto)    |
| `STORAGE_MODE=local` | **Local Storage** (Forced)  |
| `STORAGE_MODE=cloud` | **Cloud Storage** (Forced)  |
