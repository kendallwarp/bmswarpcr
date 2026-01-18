# Warp CR - Deployment Guide

## Prerequisites

- Supabase account (free tier available)
- Vercel account (free tier available)
- Git repository with your code

---

## Step 1: Supabase Setup

### 1.1 Create Project

✅ **Already Done!** Your project is created:
- **URL**: `https://vrcecbmgvlfeaefxooaw.supabase.co`
- **Anon Key**: Configured in `.env`

### 1.2 Enable Email Authentication

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **Email** provider
3. Configure email templates (optional)

### 1.3 Run Database Migration

1. Go to SQL Editor in Supabase Dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and click **Run**
4. Verify tables created: `profiles`, `brands`, `posts`

### 1.4 Test RLS Policies

Create a test user:
```sql
-- This will be done through the app's signup form
```

---

## Step 2: Local Testing

### 2.1 Environment Variables

✅ **Already configured** in `.env`:
```
VITE_SUPABASE_URL=https://vrcecbmgvlfeaefxooaw.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 2.2 Test Authentication

1. Run `npm run dev`
2. You should see the login screen
3. Create an account with your email
4. Check Supabase Dashboard → Authentication → Users
5. Verify profile created in `profiles` table

### 2.3 Test Data Creation

1. Login to the app
2. Create a brand
3. Create a post
4. Verify data in Supabase Dashboard → Table Editor

---

## Step 3: Vercel Deployment

### 3.1 Push to Git

```bash
git add .
git commit -m "Add Supabase authentication"
git push origin main
```

### 3.2 Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **New Project**
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Add Environment Variables

In Vercel project settings → Environment Variables:

```
VITE_SUPABASE_URL=https://vrcecbmgvlfeaefxooaw.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3.4 Deploy

Click **Deploy** and wait for build to complete.

---

## Step 4: Custom Domain (warpcr.com)

### 4.1 Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add `warpcr.com` and `www.warpcr.com`
3. Vercel will provide DNS records

### 4.2 Configure DNS

Add these records in your domain registrar:

**For root domain (warpcr.com)**:
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4.3 Wait for Propagation

DNS changes can take 24-48 hours to propagate globally.

---

## Step 5: Data Migration from LocalStorage

### 5.1 Migration Tool

A migration button will be added in Settings view:

**"Import from LocalStorage to Supabase"**

This will:
1. Read all brands and posts from Dexie (localStorage)
2. Assign `created_by` to current user
3. Insert into Supabase
4. Show progress

### 5.2 Run Migration

1. Login to production app
2. Go to Settings
3. Click "Import from LocalStorage"
4. Wait for completion
5. Verify data in Supabase Dashboard

---

## Step 6: Post-Deployment Checklist

- [ ] Test login/signup flow
- [ ] Create test brand
- [ ] Create test post
- [ ] Test calendar view
- [ ] Test dashboard
- [ ] Test PDF export
- [ ] Test data migration
- [ ] Verify RLS policies (users can't see each other's data)
- [ ] Test on mobile devices
- [ ] Configure email templates in Supabase
- [ ] Set up monitoring/alerts

---

## Troubleshooting

### Login Issues

**Problem**: "Invalid login credentials"
- Check email is verified in Supabase Dashboard
- Verify environment variables are correct
- Check browser console for errors

### Data Not Showing

**Problem**: Brands/Posts not visible
- Check RLS policies are enabled
- Verify `created_by` matches current user ID
- Check Supabase logs for policy violations

### Build Errors

**Problem**: Vercel build fails
- Check all dependencies are in `package.json`
- Verify TypeScript errors locally first
- Check build logs in Vercel dashboard

---

## Security Best Practices

1. **Never commit `.env` to Git** (already in `.gitignore`)
2. **Use Supabase Vault** for API credentials in production
3. **Enable MFA** for admin accounts
4. **Regular backups** of Supabase database
5. **Monitor auth logs** for suspicious activity

---

## Next Steps

1. **Email Customization**: Brand email templates in Supabase
2. **User Roles**: Implement Admin vs Editor permissions
3. **Team Invites**: Allow users to invite collaborators
4. **Audit Logs**: Track who created/edited what
5. **API Rate Limiting**: Protect against abuse

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Warp CR Issues**: Contact your development team

---

**Deployment Status**: 🚀 Ready to Deploy!
