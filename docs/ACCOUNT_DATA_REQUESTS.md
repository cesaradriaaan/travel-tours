# Account and Personal Data Request Procedure

This procedure is for AddyVenture administrators handling requests to access,
correct, delete, or restrict personal information.

## 1. Receive and classify the request

- Requests should arrive through the website contact form using the topic
  `Privacy or account data request`.
- Record the contact-message ID, request date, requested action, and the staff
  member assigned to it.
- Never ask the requester to send a password, access token, payment-card data,
  or a copy of an identification document through the ordinary contact form.

## 2. Verify the requester

- Match the request email with the account email.
- Ask the requester to confirm non-sensitive account or booking information
  already known to them, such as a booking reference.
- For a deletion or high-impact correction, send confirmation to the verified
  account email before changing data.
- If identity cannot be verified, pause the request and document why.

## 3. Review records and retention needs

Check the user ID across:

- Supabase Auth users
- `profiles`
- `bookings`
- `user_vouchers`
- avatar storage objects
- contact messages and replies, when they can be reliably linked

Do not automatically erase records needed for an active booking, unresolved
dispute, fraud/security investigation, accounting requirement, or another
applicable legal obligation. Restrict access or minimize fields where complete
deletion is not appropriate. Obtain qualified legal advice when uncertain.

## 4. Perform the approved action

- Access request: export only the verified requester's records.
- Correction request: update the inaccurate field and preserve an appropriate
  administrative record of the change.
- Deletion request: remove eligible avatar objects, profile/account data, and
  other eligible records in a controlled order that respects database foreign
  keys. Delete the Supabase Auth user only after dependent-data handling is
  complete.
- Never expose the Supabase service-role or backend secret to the browser.

## 5. Close the request

- Record the completion date, action taken, retained categories, and reason for
  any denied or limited portion.
- Reply through the verified channel without including raw database exports or
  sensitive internal details unless the request specifically requires a secure
  export.
- Update the contact-message status after the response is sent.

## Important

There is intentionally no one-click browser deletion endpoint. Bookings,
vouchers, storage objects, authentication records, and legally required
transaction records need a verified, coordinated review to prevent accidental
or unauthorized destruction.
