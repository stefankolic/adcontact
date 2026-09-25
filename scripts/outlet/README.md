# Outlet stock routine

The database table `outlet_inventory` (production Neon, read by the checkout) is the single source of
truth for stock. Everything else follows it. Webshop sales already decrement it through the Stripe
webhook; the steps below are for stock that leaves or is corrected outside the webshop.

## When an item is sold out (or the stock changes)

1. Set the stock. `0` means sold out.
   `node --env-file=.env.local scripts/outlet/set-stock.mjs <sku> <quantity>`
   The checkout stops accepting the item immediately ("Sold out").
2. Redeploy production so the pages follow: Vercel, Deployments, Redeploy (or merge any commit to main).
   Every build refreshes the live stock first (`scripts/outlet/sync-stock.mjs`, part of `npm run build`).
   Result: the outlet list shows "Sold out" and sinks the row, product pages replace the Buy button with
   a "sold out" notice and the schema.org offer becomes OutOfStock. Pages stay indexable.
3. Rebuild the Merchant feed and import it into the Google Sheet. The row stays with availability
   "out of stock" and quantity 0.
   `node --env-file=.env.local scripts/outlet/sync-stock.mjs`
   `npx tsx scripts/outlet/dump-feed-data.ts feed-data.json`
   `python scripts/outlet/build-merchant-feed.py <previous.xlsx> feed-data.json <new.xlsx>`
4. When stock returns, run step 1 with the new quantity and repeat 2 and 3.

`.env.local` (git-ignored) holds `DATABASE_URL`; refresh it with `vercel env pull`. If the database is
unreachable during a build, the last committed snapshot in `src/data/generated/outlet-stock.json` is used.
Vercel PREVIEW builds skip the sync on purpose (the Neon integration gives every preview its own stale database
branch) and use the committed snapshot; only production builds read the real database. Before merging a branch,
run `sync-stock.mjs` locally and commit the snapshot.
