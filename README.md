# 💍 Anne & Jesse's Wedding Photo & Video Share Site

A simple, mobile-first web app that lets wedding guests scan a QR code at reception tables and upload photos and videos directly to a private Google Drive folder owned by Anne & Jesse—**without requiring guests to log into a Google Account**.

---

## 📁 Automatic Filename Naming Format

Files saved to Google Drive are automatically renamed into a clean, chronological format:

* **When Guest Name Provided**: `Aunt_Maria_2026-09-12_18-45-30.jpg`
* **When Anonymous**: `Guest_2026-09-12_19-02-15.mov`

*(The guest's full message and upload timestamp are also saved inside the File Description metadata in Google Drive).*

---

## 🚀 Quick Setup Guide (4 Steps)

### Step 1: Create your Google Drive Folder
1. Go to [Google Drive](https://drive.google.com/) signed into Anne & Jesse's Google account.
2. Click **New** > **New Folder** and name it `Anne & Jesse Wedding Memories 2026`.
3. Open the folder, and copy the long string of letters and numbers after `/folders/` in your browser bar. This is your **Folder ID**.

---

### Step 2: Set up the Google Apps Script Backend (Free)
1. Go to [script.google.com](https://script.google.com/) and click **New project**.
2. Delete any default code in `Code.gs` and paste the contents of `google-apps-script.gs` from this project.
3. Replace `'YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE'` on line 14 with your actual **Folder ID** from Step 1.
4. Click **Deploy** (top right) > **New deployment**.
5. Select **Web app** with settings:
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone`
6. Click **Deploy**, grant permissions, and copy your **Web App URL**.

---

### Step 3: Deploy the Web Application
Deploy for free using **Vercel**, **Netlify**, or **GitHub Pages**:
- **Vercel**: Run `npx vercel` inside this folder.
- **Netlify Drop**: Drag and drop this folder onto [app.netlify.com/drop](https://app.netlify.com/drop).

---

### Step 4: Link Endpoint & Print your QR Codes!
1. Open your live website in a browser.
2. Open the **⚙️ Google Apps Script Endpoint Settings** drawer and paste your **Web App URL** from Step 2, then click **Save URL**.
3. Click on the **QR Code & Table Cards** tab.
4. Download your high-res QR code PNG or print reception tabletop cards!
