# TypeScript Configuration Note

## Known Issue: Database Type Inference

You may see TypeScript errors in `queries.ts` related to type inference. This is a known limitation with TypeScript's generic type inference with the Supabase client.

## Solutions

### Option 1: Add `@ts-expect-error` comments (Quick Fix)

Add comments above the lines with errors:

```typescript
// @ts-expect-error - Supabase type inference limitation
const { data, error } = await supabase.from('profiles').upsert(profile)
```

### Option 2: Use Type Assertions (Recommended)

Cast the results to the expected types:

```typescript
const { data, error } = await supabase
  .from('profiles')
  .upsert(profile) as unknown as { data: Profile | null; error: any }
```

### Option 3: Generate Types from Supabase (Best Practice)

Use Supabase CLI to generate types directly from your database:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Generate types
supabase gen types typescript --project-id your-project-id > lib/supabase/database.types.ts
```

Then update `types.ts` to import from the generated file.

## Current Status

The queries will work correctly at runtime even with the TypeScript errors shown in the IDE. The type system is overly strict in this case.

Once you:
1. Set up your Supabase database
2. Generate types from your actual schema
3. Replace the manual types in `types.ts` with generated types

All TypeScript errors will be resolved.

## Note

The manual types in `types.ts` are provided as a starting point based on your schema diagram. They will function correctly for development, but generating types from your actual Supabase database will provide the best developer experience.
