# TRKFLY AI — Deployment Guide

Stack: **Next.js frontend** + **FastAPI backend** + **MongoDB Atlas**.
Hosting plan: free across all services, **Namecheap = domain only**.

```
yourdomain.com  ──►  Vercel (Next.js frontend)
                            │
                            │   /api/v1/* fetches
                            ▼
                api.yourdomain.com  ──►  Render (FastAPI backend)
                                              │
                                              ▼
                                       MongoDB Atlas
```

---

## 1 · Push to GitHub

```bash
cd "C:\Users\tejas\Desktop\TRKOTARUN AI"
git remote add origin https://github.com/YOUR_USERNAME/trkfly-ai.git
git branch -M main
git push -u origin main
```

---

## 2 · Deploy backend to Render

1. Sign up / log in at https://render.com
2. Dashboard → **New +** → **Blueprint**
3. Connect your GitHub → pick the **trkfly-ai** repo
4. Render reads `backend/render.yaml` and proposes a `trkfly-api` web service. Click **Apply**.
5. After provisioning, open the service → **Environment** tab → set:

   | Variable | Value |
   |---|---|
   | `MONGO_URI` | Your MongoDB Atlas connection string |
   | `GEMINI_API_KEY` | Your Google AI Studio key |
   | `CORS_ORIGINS` | `["https://yourdomain.com","https://www.yourdomain.com"]` (will update later) |

6. Render redeploys automatically. Wait for **Live**.
7. Test: open `https://trkfly-api.onrender.com/health` → should return `{"status":"healthy"}`.

> ⚠️ Free tier sleeps after 15 min idle and takes ~30s to wake. For production use, upgrade to the $7/mo Starter plan.

---

## 3 · Deploy frontend to Vercel

1. Sign up / log in at https://vercel.com using your GitHub account
2. Dashboard → **Add New** → **Project** → import the **trkfly-ai** repo
3. **Root Directory** → click **Edit** → set to `frontend`
4. **Framework Preset** → Next.js (auto-detected)
5. **Environment Variables** → add:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://trkfly-api.onrender.com/api/v1` |

6. Click **Deploy**. Build takes ~2 min.
7. After deploy, Vercel gives you a URL like `trkfly-ai.vercel.app` — open it to verify.

---

## 4 · Point your Namecheap domain

You'll wire two DNS records: root → Vercel, `api.` → Render.

### A) Connect domain to Vercel (root + www)

1. **Vercel** → your project → **Settings** → **Domains** → **Add** → enter `yourdomain.com`
2. Vercel shows DNS instructions. Copy them.
3. Log in to **Namecheap** → **Domain List** → **Manage** → **Advanced DNS**
4. Delete any existing `A` records for `@` and `CNAME` for `www`.
5. Add these records:

   | Type | Host | Value | TTL |
   |---|---|---|---|
   | `A` | `@` | `76.76.21.21` | Automatic |
   | `CNAME` | `www` | `cname.vercel-dns.com.` | Automatic |

6. Back in Vercel, also add the `www.yourdomain.com` variant — it'll redirect to the apex automatically.
7. DNS propagation: usually 5-30 min, can take up to 24h. Vercel auto-issues SSL.

### B) Connect `api.yourdomain.com` to Render

1. **Render** → your service → **Settings** → **Custom Domains** → **Add Custom Domain** → enter `api.yourdomain.com`
2. Render shows a CNAME target like `trkfly-api.onrender.com`.
3. In Namecheap **Advanced DNS**, add:

   | Type | Host | Value | TTL |
   |---|---|---|---|
   | `CNAME` | `api` | `trkfly-api.onrender.com.` | Automatic |

4. Back in Render, click **Verify**. SSL auto-issues within minutes.

---

## 5 · Final wiring

Once DNS is live (test by opening `https://yourdomain.com` and `https://api.yourdomain.com/health`):

1. **Render → Environment** → update `CORS_ORIGINS` to:
   ```
   ["https://yourdomain.com","https://www.yourdomain.com"]
   ```
   Click **Save Changes** → Render redeploys.

2. **Vercel → Settings → Environment Variables** → edit `NEXT_PUBLIC_API_URL` to:
   ```
   https://api.yourdomain.com/api/v1
   ```
   Click **Save** → **Deployments** tab → trigger a redeploy.

Done. Open `https://yourdomain.com` — every feature should work end-to-end.

---

## 6 · Operational notes

**Cost** (free-tier limits):
- Vercel: 100 GB bandwidth / month — plenty for thousands of visits
- Render Free: 750 hr/month + auto-sleep after 15 min idle
- MongoDB Atlas Free (M0): 512 MB storage
- Gemini API: pay-per-use after free quota (~20 RPD on `gemini-2.5-flash`)

**Upgrade triggers**:
- > 5k monthly users → Vercel Pro ($20/mo)
- Cold starts hurt UX → Render Starter ($7/mo, no sleep)
- DB > 400 MB → Atlas M2 ($9/mo)

**Continuous deploy**: every `git push origin main` triggers a Vercel build + Render redeploy. No manual steps needed.

**Rollback**: both Vercel and Render let you redeploy any previous commit with one click.

**Logs**: Render dashboard → Logs tab; Vercel dashboard → project → Logs.

**Health checks**: Render auto-pings `/health` every 30s.
