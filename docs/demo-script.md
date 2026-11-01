# RePlate demo script (Lab 5 & 6)

About 6½ minutes. Times are cumulative. **Do** is what to click; **Say** is what to say.

## Before you start (10 minutes before)

1. Reset the demo data, so pickup times are fresh and nothing from a rehearsal is left over:
   ```bash
   npm run db:seed-demo -w @replate/api
   ```
2. Start the app with `npm run dev` and open http://localhost:5173 in Chrome. On campus Wi-Fi, make sure `NODE_EXTRA_CA_CERTS` is set (see the README's Troubleshooting section).
3. Have the demo password ready. It is `DEMO_PASSWORD` in `apps/api/.env`, and every demo account uses it.
4. Make sure you are signed out, the theme is light, and the browser zoom is 110% so the room can read it.
5. Allow location access for localhost once, so "Use my current location" doesn't stop at a permission prompt.
6. Have VS Code open on `apps/web/src` for the code tour at the end.

| Account      | Email                                                   |
| ------------ | ------------------------------------------------------- |
| Donor        | `demo-donor@example.com` (Spice Route Kitchen)          |
| Verified NGO | `demo-ngo@example.com` (Annapurna Community Food Trust) |
| Admin        | `demo-admin@example.com`                                |

## 0:00 – Introduction (40 s)

**Say:** "RePlate connects restaurants and households that have surplus food with NGOs nearby. In Part 1 it was a single HTML page that saved to localStorage. For this lab I rebuilt it in React with TypeScript, an Express REST API and a PostgreSQL database on Supabase. There are three roles: donors list food, NGOs claim and collect it, and an admin verifies NGOs."

## 0:40 – Sign-up form: radio buttons and multiple inputs (30 s)

**Do:** Click **Get started**. Switch between the two role cards, and stop on **I represent an NGO**.

**Say:** "The role is a reusable `RadioGroup` component. When NGO is selected, the form shows the registration number field. Every field is controlled with `useState`." Don't submit, because a real sign-up sends a confirmation email.

## 1:10 – Sign in as the donor (20 s)

**Do:** Click **Sign in**, enter `demo-donor@example.com` and the password.

**Say:** "The dashboard reads the donor's donations from the database: three waiting for an NGO, one being picked up, one collected."

## 1:30 – Create (75 s)

**Do:** Click **Donate food**, then click **List donation** straight away.

**Say:** "Validation runs before anything is sent, and each field shows its own message. The same rules run again in the API, because the browser can be bypassed."

**Do:** Fill in the form:

- Title: _Veg biryani and raita from lunch buffet_
- Category: **Cooked meal** (select dropdown)
- Food type: **Veg** (radio buttons)
- Quantity: _40_
- Tick **Nuts** and **Dairy**
- Collect by: click **In 4 h**
- Click **Use my current location**. The pin drops and the address fills in.

Then click **List donation**.

**Say:** "It is saved with a POST request and opens on its own page, with the map and a confirmation message."

## 2:45 – Read (30 s)

**Do:** Click **My donations**.

**Say:** "This is the Read operation: every donation from the database, newest first, with its status. Each card is a reusable `DonationCard` component."

## 3:15 – Search, the bonus (30 s)

**Do:** Type _rice_ into the search box. Then clear it and choose **Cancelled** in the status dropdown.

**Say:** "Search filters as you type, and the database does the filtering. It waits until you pause typing, so every key press doesn't send a request. The search is kept in the URL, so it survives a reload."

**Do:** Set the status back to **All statuses**.

## 3:45 – Update (35 s)

**Do:** Open the biryani donation, click **Edit**, change the quantity to _55_, and click **Save changes**.

**Say:** "The form opens with the saved values. Only the changed fields are sent with a PATCH request. Editing is only allowed until an NGO claims the donation, and the database enforces that too."

## 4:20 – Delete (30 s)

**Do:** Open **Paneer butter masala and jeera rice**, click **Delete**, then confirm.

**Say:** "Deleting asks for confirmation first. After the DELETE request the list updates without a page reload."

## 4:50 – The NGO side (70 s)

**Do:** Sign out, then sign in as `demo-ngo@example.com`.

**Say:** "A verified NGO sees open donations within 10 km, nearest first, on a list and a map."

**Do:**

1. Choose **Bakery** in the Category filter, then set it back to **Any**.
2. On the biryani donation you just made, click **Claim** and confirm.
3. Go to **My pickups**, then click **Mark collected** on it.

**Say:** "Claiming runs in a single database function, so two NGOs can never claim the same food. Once it's claimed, the donor and the NGO can see each other's phone numbers."

## 6:00 – Admin (25 s)

**Do:** Sign out, sign in as `demo-admin@example.com`, and click **Verify** on Seva Meals Foundation.

**Say:** "New NGOs can't see any food until an admin checks their registration."

## 6:25 – Responsive design and code (35 s)

**Do:**

1. Open DevTools and turn on the device toolbar (Cmd+Shift+M) at iPhone width. Show the menu, then click the moon button to switch to dark mode.
2. Switch to VS Code and show:
   - `components/ui/`: the reusable components
   - `features/donations/DonationForm.tsx`: `useState` and `handleSubmit`
   - `supabase/migrations`: the tables and access rules

**Say:** "The layout works down to 320 px phones, so it can be wrapped as a mobile app with Capacitor later."

## 7:00 – End

**Say:** "That covers Create, Read, Update, Delete and search against a real database. Thank you."

## If something goes wrong

- **"Could not reach RePlate"**: the API isn't running or the network blocks Supabase. Restart `npm run dev`, then check `NODE_EXTRA_CA_CERTS`.
- **Location doesn't work**: type _MG Road, Bengaluru_ in the address box and click **Find on map** instead.
- **Find food shows nothing**: donations expire. Run `npm run db:seed-demo -w @replate/api` again.
- **Everything is down**: show the screenshots in the report.

## Likely questions

- **Why Supabase instead of JSON Server?** The data is relational (users, NGOs, donations, history), and it needs real sign-in and per-user access rules. JSON Server has neither.
- **Where is the state?** Form fields use `useState`. Data from the API is cached by TanStack Query, which refetches the lists after every change.
- **How do you stop one donor editing another donor's food?** The API checks the user's role, and the database's Row Level Security only lets donors change their own rows. Both layers check every request.
