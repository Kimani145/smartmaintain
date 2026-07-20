# Swagger Documentation Overview

The OpenAPI 3.1 Specification for SMARTMAINTAIN is located in `openapi.json`. 

You can interact with this specification using Swagger UI.

## Viewing in Swagger UI
1. Navigate to [https://editor.swagger.io/](https://editor.swagger.io/)
2. Paste the contents of `docs/openapi.json`.
3. The UI will render the `maintenance_requests` and `profiles` endpoints automatically.

## Authentication in Swagger
The API uses Bearer Tokens (JWT). Click the **Authorize** button in Swagger UI and insert your active Supabase user session token.

For Supabase PostgREST endpoints, you must also pass the `apikey` header matching your `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
