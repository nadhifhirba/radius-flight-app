# Step-by-Step Guide: Live Real-Time Deployment on Netlify

To get your website live with **Real-Time Data**, you need to use Netlify's "Git Integration". This allows your backend server (the Amadeus proxy I built) to run as "Serverless Functions".

## Phase 1: Upload to GitHub
1.  **Create a GitHub Account**: If you don't have one, sign up at [github.com](https://github.com).
2.  **Create a New Repository**:
    *   Click the **+** icon in the top right -> **New repository**.
    *   Name it `radius-flight-app`.
    *   Keep it **Public** (or Private if you prefer).
    *   Do **NOT** initialize it with a README or .gitignore (I've already provided those).
3.  **Upload your files**:
    *   Open the folder `/Users/malka/.gemini/antigravity/scratch/travel-reverse-search` in your computer.
    *   On the GitHub website, click "uploading an existing file".
    *   **Drag and drop EVERY file and folder** from your project folder into GitHub.
    *   *Note: Do NOT upload the `node_modules` folder (GitHub will ignore it anyway).*
    *   Click **Commit changes**.

---

## Phase 2: Connect to Netlify
1.  Log in to [Netlify](https://app.netlify.com).
2.  Click **Add new site** -> **Import from an existing project**.
3.  Choose **GitHub** and select your `radius-flight-app` repository.
4.  **Important Build Settings**:
    *   **Build command**: `npm install` (Netlify usually detects this automatically).
    *   **Publish directory**: `.` (The current folder).
5.  Click **Deploy site**.

---

## Phase 3: Set Your Secret Keys (The "Magic" Step)
The website won't have live data yet because Netlify doesn't know your Amadeus keys.
1.  In your Netlify Dashboard, go to **Site configuration** (on the left sidebar).
2.  Click **Environment variables**.
3.  Click **Add a variable** -> **Add a single variable**.
4.  Add these two:
    *   **Key**: `AMADEUS_CLIENT_ID`
    *   **Value**: `oVAiTStE8oG20JHm4AvTizo0YL15C4KD`
5.  Click **Add another variable**:
    *   **Key**: `AMADEUS_CLIENT_SECRET`
    *   **Value**: `zGStNQSg1IXUmtAw`
6.  Click **Create variable**.

---

## Phase 4: Redeploy
1.  Go to the **Deploys** tab in Netlify.
2.  Click **Trigger deploy** -> **Clear cache and deploy site**.
3.  Once it finishes, open your Netlify URL!

**You are now Live!** 🚀
Your website is now talking to Amadeus securely via Netlify's global servers. Every time you search, it will fetch live prices.
