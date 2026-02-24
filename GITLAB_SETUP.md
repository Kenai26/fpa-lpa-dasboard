# 🔧 Walmart GitLab Setup - Step by Step

## 📝 Quick Summary
You're about to create a git repository on Walmart GitLab to host your FPA/LPA Dashboard.

**Time required**: 2-3 minutes  
**Cost**: Free (internal Walmart service)  
**Result**: Your code will be hosted and ready for Puppy Pages publication

---

## 🚀 Step-by-Step Instructions

### Step 1: Go to Walmart GitLab
1. Open your browser
2. Go to: **https://gitlab.walmart.com**
3. Log in with your **Walmart credentials** (same as email/Windows login)

### Step 2: Create a New Project

**Option A: Using the + Button**
1. Look for the **"+" button** (top right or left sidebar)
2. Click **"New project"**

**Option B: Using Top Menu**
1. Click **"Projects"** in the top menu
2. Click **"New project"**

### Step 3: Configure Project Settings

On the "Create project" page, fill in:

| Field | Value |
|-------|-------|
| **Project name** | `fpa-lpa-dashboard` |
| **Project slug** | `fpa-lpa-dashboard` (auto-fills) |
| **Project URL** | Will show as `https://gitlab.walmart.com/YOUR-USERNAME/fpa-lpa-dashboard` |
| **Visibility level** | **Private** (important - internal only) |
| **Initialize repository with a README** | ❌ Leave **UNCHECKED** (we have code already) |
| **.gitignore template** | Leave empty |
| **License template** | Leave empty |

### Step 4: Create the Project

1. Click **"Create project"** (blue button at bottom)
2. Wait a few seconds for GitLab to create the repo
3. You'll see a page that says "The repository for this project is empty"

### Step 5: Get Your Repository URL

**THIS IS THE IMPORTANT PART:**

1. On the empty project page, look for the **blue "Clone" button** (top right area)
2. Click it
3. You'll see two options:
   - **HTTPS** (recommended) ← Click this
   - SSH
4. **Copy the HTTPS URL**

It will look like:
```
https://gitlab.walmart.com/your-username/fpa-lpa-dashboard.git
```

**COPY THIS URL** - you'll need it in the next step!

---

## ✅ Verify Your Setup

Once you're in your new GitLab project, you should see:
- Empty repository message
- "Clone" button in the top right
- URL in the format: `https://gitlab.walmart.com/USERNAME/fpa-lpa-dashboard.git`

---

## 🎯 Next: Provide Your URL

Once you've completed these steps:

1. **Copy your HTTPS git URL** from GitLab
2. **Come back and tell me the URL**
3. I'll automatically:
   - Configure your local git remote
   - Update puppy.config.json
   - Push all your code to GitLab
   - Verify everything
   - Show you how to submit to Puppy Pages

---

## 🆘 Troubleshooting

### "I can't log in to GitLab"
- Use your Walmart email address (mplucer@walmart.com)
- Use your Walmart password (same as Windows login)
- Make sure you have GitLab access (contact your IT department if not)

### "I don't see the Clone button"
- Make sure you're on your project's main page
- The Clone button is in the top right area
- It's a blue button with a clipboard icon

### "The URL looks different"
- GitLab URLs should look like:
  - `https://gitlab.walmart.com/your-username/fpa-lpa-dashboard.git` ✅
  - `https://your-gitlab-instance.com/path/fpa-lpa-dashboard.git` ✅
- Just copy whatever URL GitLab shows you in the Clone popup

### "I need to change the project to Private"
1. Go to **Settings** (left sidebar)
2. Click **General**
3. Scroll to **Visibility and access controls**
4. Change to **Private**
5. Click **Save changes**

---

## ⏱️ Timeline

- **Step 1-5**: 2-3 minutes
- **Provide URL to Code Puppy**: 30 seconds
- **Code Puppy pushes code**: 1 minute
- **Total time to live on Puppy Pages**: ~10 minutes!

---

## 📞 Need Help?

- **GitLab Help**: https://docs.gitlab.com
- **Walmart IT Support**: Contact your IT department
- **Code Puppy Support**: Slack #code-puppy-support

---

**Ready? Go create your GitLab project and come back with the URL!** 🚀