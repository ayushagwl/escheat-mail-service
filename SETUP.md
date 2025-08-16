# Quick Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `escheat-mail-service`
   - Database Password: Choose a strong password
   - Region: Choose closest to you
5. Click "Create new project"

## 2. Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## 3. Create Environment File

1. In your project root, create a file named `.env`
2. Add the following content (replace with your actual values):

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Set Up Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire content of `supabase-setup.sql`
4. Click "Run" to execute the script

## 5. Start the Application

```bash
npm start
```

The app should now work without the Supabase error!

## Troubleshooting

### If you still see the error:
1. Make sure your `.env` file is in the project root (same level as `package.json`)
2. Restart your development server after creating the `.env` file
3. Check that your Supabase URL and key are correct

### To verify your setup:
1. Open browser console (F12)
2. You should see a success message instead of the warning
3. Try to register a new account - it should work!

## Next Steps

Once the app is running:
1. Register a new account
2. Try creating a letter
3. Upload the sample CSV file (`sample-recipients.csv`)
4. Test the pricing calculator

## Optional: Real Mailing Service

To integrate with actual mailing services:
1. Sign up for [Lob](https://lob.com) or [Postgrid](https://postgrid.com)
2. Get your API key
3. Add `REACT_APP_LOB_API_KEY=your_key` to your `.env` file
