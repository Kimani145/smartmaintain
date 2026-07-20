# Local Installation

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd smartmaintain
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Database Setup**:
   Execute `supabase/schema.sql` in your Supabase project's SQL editor.
   Create `maintenance-images` and `profile-images` storage buckets.
