# How to Update Your Live Website

Since you are using the **GitHub + Netlify** method, updating your website is very easy. You don't need to touch Netlify; you only need to update the files on GitHub.

### Step 1: Prepare your files
Make sure your local files in `/Users/malka/.gemini/antigravity/scratch/travel-reverse-search` are saved and ready.

### Step 2: Upload to GitHub (The "Manual" Web Way)
1.  Go to your repository on [GitHub.com](https://github.com/your-username/radius-flight-app).
2.  Click the **Add file** button (near the top right of the file list).
3.  Choose **Upload files**.
4.  Drag and drop the specific files you changed (e.g., `app.js`, `index.html`, or `styles.css`) from your computer into the browser.
5.  Scroll down to the "Commit changes" box.
6.  Type a short note like "Updated footer" or "Fixed alignment".
7.  Click **Commit changes**.

### Step 3: Netlify Does the Rest
*   As soon as you click "Commit changes" on GitHub, Netlify will "see" the update.
*   Netlify will automatically start a new "Deploy".
*   In about 30–60 seconds, your live website will be updated automatically!

### How to check if it's working:
1.  Go to your **Netlify Dashboard**.
2.  Look at the **Production deploys** list.
3.  You will see a new entry labeled "Building" or "Published" with your commit message (e.g., "Updated footer").

---

### Pro Tip (The "Real" Developer Way)
Eventually, as you get more comfortable, you can use the **Terminal** to update files instantly without dragging and dropping:
```bash
git add .
git commit -m "Your update message"
git push origin main
```
But for now, the drag-and-drop method on GitHub.com works perfectly!
