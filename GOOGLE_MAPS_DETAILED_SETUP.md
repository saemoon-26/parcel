# 🗺️ Google Maps API Key Setup - Step by Step

## Your Project Details:
- **Project ID:** fruitdetector-483112
- **Project Number:** 976314363974

## 📋 Step-by-Step Instructions:

### Step 1: Enable Required APIs
1. In Google Cloud Console, click on **"APIs & Services"** (from left sidebar or Quick access)
2. Click **"+ ENABLE APIS AND SERVICES"** (blue button at top)
3. Search and enable these 3 APIs one by one:
   - **Maps JavaScript API** ✅
   - **Places API** ✅
   - **Geocoding API** ✅

### Step 2: Create API Key
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at top
3. Select **"API Key"**
4. Copy the API key that appears (starts with `AIzaSy...`)

### Step 3: Secure Your API Key (Optional but Recommended)
1. Click **"RESTRICT KEY"** button
2. Under **"Application restrictions"**:
   - Select **"HTTP referrers (web sites)"**
   - Add: `http://localhost:*/*` (for development)
3. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Check only:
     - Maps JavaScript API
     - Places API
     - Geocoding API
4. Click **"SAVE"**

### Step 4: Enable Billing (Required for Maps API)
1. Go to **"Billing"** from left sidebar
2. Click **"LINK A BILLING ACCOUNT"**
3. Add credit card details
   - **Don't worry:** Google gives $200 free credit per month
   - **Free tier:** 28,000 map loads/month FREE
   - You won't be charged unless you exceed free limits

### Step 5: Add API Key to Your Project
1. Open file: `d:\React_Course\parcel\.env`
2. Replace with your actual key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. Save the file

### Step 6: Restart Your App
```bash
cd d:\React_Course\parcel
npm run dev
```

## ✅ Test Your Integration:
1. Open your app in browser
2. Click "Add New Parcel"
3. Click the 📍 icon next to "Pickup Location"
4. Map should load successfully!

## 🆘 Troubleshooting:

### If map shows "For development purposes only":
- Billing is not enabled
- Go to Billing and add payment method

### If map doesn't load:
- Check if all 3 APIs are enabled
- Check if API key is correct in `.env` file
- Restart the dev server

### If you see errors in console:
- Open browser console (F12)
- Check error message
- Usually it's API not enabled or billing issue

## 💰 Pricing (Don't Worry!):
- **Free:** First $200 credit every month
- **Free:** 28,000 map loads per month
- **Your usage:** Probably 100-500 loads/month
- **Cost:** $0 (you won't exceed free tier)

## 📞 Need Help?
If you face any issues, share the error message from browser console (F12).
