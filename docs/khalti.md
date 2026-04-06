# Khalti Integration Notes

Bubble uses Khalti's official ePayment flow:

1. Backend calls Khalti `epayment/initiate`.
2. Khalti returns `pidx` and `payment_url`.
3. Mobile app opens `payment_url` in an in-app checkout screen.
4. When Khalti redirects to `KHALTI_RETURN_URL`, the app intercepts that URL and routes to `/donate/result`.
5. Backend calls Khalti `epayment/lookup` and Bubble marks the donation from the verified status.

Important env keys:

- `KHALTI_SECRET_KEY`
- `EXPO_PUBLIC_KHALTI_ENV`
- `KHALTI_WEBSITE_URL`
- `KHALTI_RETURN_URL`

Notes:

- `EXPO_PUBLIC_KHALTI_PUBLIC_KEY` is not used by the current Bubble app flow.
- `KHALTI_RETURN_URL` should ideally be reachable from the test device, but Bubble now intercepts the callback URL inside the in-app checkout before loading the callback page.
- `10.0.2.2` is Android emulator-only. For real devices, prefer a LAN IP or tunnel URL.

Official docs used for this integration:

- https://docs.khalti.com/getting-started/
- https://docs.khalti.com/checkout/diy-banking/
