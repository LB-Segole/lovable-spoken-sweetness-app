
-- First, let's check what policies exist and clean up team_members policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('team_members', 'agent_templates');

-- Drop existing problematic team_members policies if they exist
DO $$ 
BEGIN
    -- Drop team_members policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'team_members_select_policy') THEN
        DROP POLICY "team_members_select_policy" ON public.team_members;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'team_members_insert_policy') THEN
        DROP POLICY "team_members_insert_policy" ON public.team_members;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'team_members_update_policy') THEN
        DROP POLICY "team_members_update_policy" ON public.team_members;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'team_members_delete_policy') THEN
        DROP POLICY "team_members_delete_policy" ON public.team_members;
    END IF;
    
    -- Drop any other existing team_members policies that might cause recursion
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Users can view team memberships they belong to') THEN
        DROP POLICY "Users can view team memberships they belong to" ON public.team_members;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Team owners can manage team members') THEN
        DROP POLICY "Team owners can manage team members" ON public.team_members;
    END IF;
END $$;

-- Create simple, non-recursive RLS policies for team_members
CREATE POLICY "Users can view team memberships they belong to" 
  ON public.team_members 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Team owners can manage team members" 
  ON public.team_members 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE teams.id = team_members.team_id 
      AND teams.owner_id = auth.uid()
    )
  );
