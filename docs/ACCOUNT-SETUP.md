# OnimaChain account activation

The application now includes a custom account experience at `/account` using `@netlify/identity`. Source code alone does not enable the Identity service. Complete the dashboard steps below on the **new OnimaChain site only**.

## Correct Netlify project

- Team: `create-ovudczw`
- Site: `onimachain`
- Site ID: `1823cc58-f887-422f-9dda-3adfb25d5293`
- Current preview origin: `https://onimachain.netlify.app`
- Do not change the old `cyravon` site.

## Activation steps

1. Open the new site's Netlify dashboard and select **Identity**.
2. Enable Identity for this project.
3. Under Identity registration preferences, select **Open** so customers can create their own account.
4. Keep email confirmation enabled. Do not enable autoconfirm for production customer accounts.
5. Confirm the Identity site URL uses the HTTPS OnimaChain origin currently under test. Do not attach or move custom domains as part of account activation.
6. Deploy this branch, then create a test account at `/account` and complete the confirmation link.
7. Verify sign in, sign out, password recovery, profile preference updates, and permanent account deletion.

## Information stored

Netlify Identity owns the password credential and session. OnimaChain adds the following user metadata at registration:

- `full_name`
- `age_confirmed`
- `marketing_consent`
- `marketing_consent_at`
- `account_source`

Product email consent is optional and is not implied by account creation. Identity users and their metadata can be reviewed from the new site's Identity user list. The public Privacy page describes this collection.

## Intentional limits

- The waitlist remains paused and separate from customer accounts.
- No checkout or payment mode is enabled.
- Research tools remain public; an account is not required to use the mouse-study calculator.
- This work does not add a human-dose, syringe-unit, or milligram-syringe calculator.
