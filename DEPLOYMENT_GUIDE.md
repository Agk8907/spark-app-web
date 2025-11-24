# 🚀 Deployment & Distribution Guide

It is important to understand that your project has **two separate parts** that are deployed differently:

1.  **The Backend (Server)** → Deployed to a Cloud Host (Render, Heroku, Railway)
2.  **The Frontend (App)** → Deployed to App Stores (Google Play, Apple App Store)

---

## Part 1: Deploying the Backend (The Brain) 🧠

You must deploy the backend first so your app has a server to talk to.

### Recommended Host: **Render** (Free & Easy)

1.  **Push your code to GitHub**.
2.  **Sign up at [render.com](https://render.com)**.
3.  **Create a "Web Service"**.
4.  **Connect your GitHub repo**.
5.  **Settings**:
    - **Root Directory**: `server` (Important! Your server code is in this subfolder)
    - **Build Command**: `npm install`
    - **Start Command**: `node server.js`
6.  **Environment Variables** (Add these in the Render Dashboard):
    - `MONGODB_URI`: Your MongoDB Atlas connection string.
    - `JWT_SECRET`: A long random secret code.
    - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary name.
    - `CLOUDINARY_API_KEY`: Your Cloudinary key.
    - `CLOUDINARY_API_SECRET`: Your Cloudinary secret.
    - `STORAGE_MODE`: `cloud`

**Result**: Render gives you a URL like `https://socialfeed-api.onrender.com`.

---

## Part 2: Distributing the App (The Interface) 📱

Once your backend is live on Render, follow these exact steps in your **VS Code Terminal**:

### Step 1: Point Frontend to Live Backend

1.  Open your root `.env` file (or `src/services/api.js`).
2.  Update `API_URL` and `SOCKET_URL` to your new Render URL:
    ```env
    # .env file
    API_URL=https://your-app-name.onrender.com/api
    SOCKET_URL=https://your-app-name.onrender.com
    ```

### Step 2: Install EAS CLI (One time only)

Run this command in your terminal:

```bash
npm install -g eas-cli
```

### Step 3: Login to Expo

```bash
eas login
```

### Step 4: Configure Build

```bash
eas build:configure
```

_Select "Android" when asked._

### Step 5: Build the APK

Run this command to build the file for your phone:

```bash
eas build -p android --profile preview
```

### Step 6: Install on Phone

1.  Wait for the build to finish (it takes 10-15 minutes).
2.  Expo will give you a **QR Code** and a **Download Link**.
3.  Scan the QR code with your Android phone to download and install the `.apk` file.

**🎉 You now have the real app installed!**

---

## Summary

| Component    | Where it lives  | How users access it                                       |
| :----------- | :-------------- | :-------------------------------------------------------- |
| **Backend**  | Render / Heroku | They don't see it directly. The app talks to it silently. |
| **Frontend** | User's Phone    | They download the App (APK) or install from App Store.    |

**You cannot "open" the Android app in a browser via Render.** Render only hosts the API data. The app must be installed on the device.
