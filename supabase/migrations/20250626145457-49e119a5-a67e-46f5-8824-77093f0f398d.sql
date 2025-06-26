
-- First, drop all existing problematic policies on team_members
DO $$ 
DECLARE
    policy_name TEXT;
BEGIN
    -- Get all policy names for team_members table and drop them
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'team_members' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.team_members', policy_name);
    END LOOP;
END $$;

-- Create simple, non-recursive RLS policies for team_members
-- Policy 1: Users can view team memberships where they are a member
CREATE POLICY "team_members_select_own" 
  ON public.team_members 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Policy 2: Team owners can view all team members (without recursive checks)
CREATE POLICY "team_members_select_as_owner" 
  ON public.team_members 
  FOR SELECT 
  USING (
    team_id IN (
      SELECT id FROM public.teams 
      WHERE owner_id = auth.uid()
    )
  );

-- Policy 3: Team owners can insert new team members
CREATE POLICY "team_members_insert_as_owner" 
  ON public.team_members 
  FOR INSERT 
  WITH CHECK (
    team_id IN (
      SELECT id FROM public.teams 
      WHERE owner_id = auth.uid()
    )
  );

-- Policy 4: Team owners can update team members
CREATE POLICY "team_members_update_as_owner" 
  ON public.team_members 
  FOR UPDATE 
  USING (
    team_id IN (
      SELECT id FROM public.teams 
      WHERE owner_id = auth.uid()
    )
  );

-- Policy 5: Team owners can delete team members
CREATE POLICY "team_members_delete_as_owner" 
  ON public.team_members 
  FOR DELETE 
  USING (
    team_id IN (
      SELECT id FROM public.teams 
      WHERE owner_id = auth.uid()
    )
  );

-- Also ensure agent_templates table has proper RLS policies
-- Drop any existing policies that might be problematic
DROP POLICY IF EXISTS "Public templates are viewable by everyone" ON public.agent_templates;
DROP POLICY IF EXISTS "Users can view their own templates" ON public.agent_templates;
DROP POLICY IF EXISTS "Users can create templates" ON public.agent_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON public.agent_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON public.agent_templates;

-- Create clean policies for agent_templates
CREATE POLICY "agent_templates_select_public" 
  ON public.agent_templates 
  FOR SELECT 
  USING (is_public = true);

CREATE POLICY "agent_templates_select_own" 
  ON public.agent_templates 
  FOR SELECT 
  USING (created_by = auth.uid());

CREATE POLICY "agent_templates_insert_own" 
  ON public.agent_templates 
  FOR INSERT 
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "agent_templates_update_own" 
  ON public.agent_templates 
  FOR UPDATE 
  USING (created_by = auth.uid());

CREATE POLICY "agent_templates_delete_own" 
  ON public.agent_templates 
  FOR DELETE 
  USING (created_by = auth.uid());
