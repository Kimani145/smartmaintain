import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function inspect() {
  console.log('Fetching database profiles...')
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(10)
  
  console.log('Profiles in DB:', JSON.stringify(profiles, null, 2))
  if (profilesError) console.error('Profiles error:', profilesError)

  console.log('Fetching maintenance requests...')
  const { data: requests, error: requestsError } = await supabase
    .from('maintenance_requests')
    .select('*')
    .limit(5)
  console.log('Requests in DB:', JSON.stringify(requests, null, 2))
  if (requestsError) console.error('Requests error:', requestsError)

  console.log('Fetching properties...')
  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select('*')
  console.log('Properties in DB:', JSON.stringify(properties, null, 2))
}

inspect()
