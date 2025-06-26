
-- Create agent_templates table
CREATE TABLE IF NOT EXISTS public.agent_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    template_data JSONB NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID,
    is_public BOOLEAN DEFAULT false,
    rating_average NUMERIC(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create template_reviews table
CREATE TABLE IF NOT EXISTS public.template_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES public.agent_templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(template_id, user_id)
);

-- Enable RLS
ALTER TABLE public.agent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for agent_templates
CREATE POLICY "Public templates are viewable by everyone" ON public.agent_templates
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own templates" ON public.agent_templates
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create templates" ON public.agent_templates
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates" ON public.agent_templates
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own templates" ON public.agent_templates
    FOR DELETE USING (auth.uid() = created_by);

-- Create policies for template_reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.template_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own reviews" ON public.template_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.template_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.template_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Insert some sample public templates
INSERT INTO public.agent_templates (name, description, category, tags, template_data, is_public, created_by) VALUES
(
    'Sales Assistant',
    'A helpful sales assistant for lead qualification and customer support',
    'sales',
    ARRAY['sales', 'customer-service', 'lead-qualification'],
    '{"system_prompt": "You are a professional sales assistant. Help qualify leads and provide excellent customer service.", "first_message": "Hello! I''m here to help you with your sales inquiry. How can I assist you today?", "voice_provider": "deepgram", "voice_id": "aura-asteria-en", "model": "nova-2", "temperature": 0.8, "max_tokens": 500}',
    true,
    (SELECT id FROM auth.users LIMIT 1)
),
(
    'Customer Support',
    'Professional customer support agent for handling inquiries and issues',
    'support',
    ARRAY['support', 'customer-service', 'help-desk'],
    '{"system_prompt": "You are a friendly customer support representative. Help customers with their questions and resolve issues professionally.", "first_message": "Hi there! I''m your customer support assistant. How can I help you today?", "voice_provider": "deepgram", "voice_id": "aura-asteria-en", "model": "nova-2", "temperature": 0.7, "max_tokens": 500}',
    true,
    (SELECT id FROM auth.users LIMIT 1)
),
(
    'Appointment Scheduler',
    'Efficient appointment scheduling assistant for businesses',
    'scheduling',
    ARRAY['scheduling', 'appointments', 'calendar'],
    '{"system_prompt": "You are an appointment scheduling assistant. Help customers book, reschedule, or cancel appointments efficiently.", "first_message": "Hello! I can help you schedule an appointment. What service are you looking for?", "voice_provider": "deepgram", "voice_id": "aura-asteria-en", "model": "nova-2", "temperature": 0.6, "max_tokens": 400}',
    true,
    (SELECT id FROM auth.users LIMIT 1)
);
