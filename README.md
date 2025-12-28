# Radius - Flight Discovery App

Welcome! You have two ways to run this app.

## Option 1: The Simple Way (No installation needed)
**Use this if you just want to see the design and user interface.**
1.  Open the folder: `/Users/malka/.gemini/antigravity/scratch/travel-reverse-search`
2.  Double-click the `index.html` file.
3.  The app will open in your browser.
4.  **Note:** It will show a message "Using Mock Data". This is normal! The flights you see are examples, not live prices.

---

## Option 2: The Real-Time Way (Advanced)
**Use this if you want to see live flight prices from Amadeus.**
You need to install a tool called **Node.js** first.

### Step 1: Install Node.js
1.  Go to [nodejs.org](https://nodejs.org).
2.  Download the **LTS Version** (recommended for most users).
3.  Install it like a normal program.

### Step 2: Run the Server
1.  Open your Terminal (Command Prompt).
2.  Type this command and hit Enter to go to your project:
    ```bash
    cd /Users/malka/.gemini/antigravity/scratch/travel-reverse-search
    ```
3.  Install the required tools (only do this once):
    ```bash
    npm install
    ```
4.  Start the app:
    ```bash
    npm start
    ```
5.  Open your browser and type `http://localhost:3000`.
6.  Now when you search, you will see "Connected to Amadeus Live Data!".
