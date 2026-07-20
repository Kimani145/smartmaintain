# Known Limitations

At the time of the Release Candidate v1.0, the following limitations exist and are documented for transparency:

1. **Email Confirmations**: Supabase email confirmations are currently disabled in the development setup. New users are automatically confirmed upon registration.
2. **Avatar Uploads**: While the database schema supports `avatar_url`, the UI for users to upload and crop their avatars is not yet implemented.
3. **Data Pagination**: The manager dashboards currently fetch all records at once without server-side pagination. This may cause performance degradation for datasets exceeding 1,000 active maintenance requests.
4. **Push Notifications**: Only basic UI notifications are supported. Native push notifications (APNs/FCM) are not implemented.
5. **PDF Generation**: Invoicing and work-order PDF generation is not yet available natively; screenshots or browser printing must be used.
