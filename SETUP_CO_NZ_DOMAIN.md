# Setup luxtronics.co.nz Domain on Hostinger

## Problem
`luxtronics.co.nz` returns **503 Service Unavailable** error.
`luxtronics.com.au` works perfectly (HTTP 200).

## Root Cause
DNS Check shows different IPs:
```bash
$ dig luxtronics.co.nz +short
91.108.106.187
88.222.243.109

$ dig luxtronics.com.au +short  
187.127.184.76
```

**The `.co.nz` domain is NOT configured in Hostinger panel yet.**

## Solution Steps

### Option 1: Add Domain in Hostinger Panel (Recommended)

1. **Login to Hostinger**: https://hpanel.hostinger.com
2. Go to **Websites** section
3. Click **Add Domain** or **Parked Domains**
4. Add: `luxtronics.co.nz` and `www.luxtronics.co.nz`
5. Point to same folder as `.com.au`: `~/domains/luxtronics.in/public_html`
6. Wait 10-15 minutes for DNS propagation

### Option 2: Update DNS Records (If you control .co.nz domain)

If `.co.nz` is registered elsewhere (not Hostinger), update DNS:

**A Records:**
```
@ (root)    →  187.127.184.76
www         →  187.127.184.76
```

**Or CNAME (if Hostinger provides one):**
```
www  →  luxtronics.com.au
```

### Option 3: Contact Hostinger Support

If above don't work, open support ticket:
- **Issue**: Need to add `luxtronics.co.nz` as parked/addon domain
- **Point to**: Same folder as `luxtronics.com.au`
- **Current status**: 503 error, DNS pointing to wrong IPs

## After Setup

Once domain is added in Hostinger:

1. **Test DNS propagation:**
   ```bash
   dig luxtronics.co.nz +short
   # Should show: 187.127.184.76 (same as .com.au)
   ```

2. **Test website:**
   ```bash
   curl -I https://luxtronics.co.nz
   # Should show: HTTP/2 200
   ```

3. **Test in browser:**
   - Visit: https://luxtronics.co.nz
   - Should load Luxtronics homepage
   - Products should load (NZ products from `storenz.luxtronics.luxtronics.in`)

## Current Status

- ✅ **luxtronics.in** - Working
- ✅ **luxtronics.com.au** - Working (HTTP 200)
- ❌ **luxtronics.co.nz** - 503 error (not configured in Hostinger)

## Code is Ready!

Frontend code already supports `.co.nz`:
- Detects domain automatically
- Calls correct WooCommerce store: `storenz.luxtronics.luxtronics.in`
- Uses NZ credentials from `.env`

**Just need Hostinger configuration!**

---

## Quick Check Commands

```bash
# Check DNS
dig luxtronics.co.nz +short

# Check HTTP status
curl -I https://luxtronics.co.nz

# Check if domain resolves to Hostinger
whois luxtronics.co.nz | grep -i "name server"
```

---

**Next Action**: Add `luxtronics.co.nz` in Hostinger hPanel
