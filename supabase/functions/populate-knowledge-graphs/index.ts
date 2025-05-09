
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Default Network - Unclassified (Angola Intelligence Network)
    const defaultNetworkNodes = [
      {
        type: 'person',
        title: 'João Lourenço',
        description: 'President of Angola since 2017',
        network_id: 'default',
        properties: { role: 'President', age: 69, party: 'MPLA' },
        tags: ['government', 'politics', 'leadership']
      },
      {
        type: 'organization',
        title: 'MPLA',
        description: 'Popular Movement for the Liberation of Angola - ruling political party',
        network_id: 'default',
        properties: { founded: 1956, type: 'Political Party', members: '5 million' },
        tags: ['politics', 'government']
      },
      {
        type: 'location',
        title: 'Luanda',
        description: 'Capital city of Angola',
        network_id: 'default',
        properties: { population: '8.3 million', status: 'Capital', area: '116 sq mi' },
        tags: ['capital', 'urban', 'port']
      },
      {
        type: 'organization',
        title: 'Sonangol',
        description: 'Angolan state oil company',
        network_id: 'default',
        properties: { founded: 1976, industry: 'Oil and Gas', status: 'State-owned' },
        tags: ['oil', 'energy', 'state-owned']
      },
      {
        type: 'person',
        title: 'Adalberto Costa Júnior',
        description: 'Leader of opposition party UNITA',
        network_id: 'default',
        properties: { role: 'Opposition Leader', party: 'UNITA', age: 61 },
        tags: ['politics', 'opposition']
      },
    ];

    // HUMINT Collection Network - Secret
    const humintNetworkNodes = [
      {
        type: 'person',
        title: 'Agent Cobra',
        description: 'Field operative specializing in government infiltration',
        network_id: 'network-2',
        properties: { code_name: 'Cobra', years_active: 8, specialization: 'Government' },
        tags: ['field_operative', 'intelligence']
      },
      {
        type: 'person',
        title: 'Agent Viper',
        description: 'Field operative specializing in corporate intelligence',
        network_id: 'network-2',
        properties: { code_name: 'Viper', years_active: 5, specialization: 'Corporate' },
        tags: ['field_operative', 'corporate']
      },
      {
        type: 'person',
        title: 'Contact Alpha',
        description: 'High-level informant in Angolan energy ministry',
        network_id: 'network-2',
        properties: { reliability: 'High', years_active: 3, access_level: 'Senior' },
        tags: ['informant', 'government']
      },
      {
        type: 'organization',
        title: 'Eagle Network',
        description: 'Network of informants in resource extraction industries',
        network_id: 'network-2',
        properties: { members: 12, founded: 2019, focus: 'Resources' },
        tags: ['network', 'resources', 'mining']
      },
      {
        type: 'operation',
        title: 'Operation Sandstone',
        description: 'Intelligence gathering on diamond mining operations',
        network_id: 'network-2',
        properties: { status: 'Active', start_date: '2023-01-15', priority: 'Medium' },
        tags: ['active', 'mining', 'diamonds']
      }
    ];

    // Critical Infrastructure Network - Secret
    const infraNetworkNodes = [
      {
        type: 'location',
        title: 'Laúca Dam',
        description: 'Major hydroelectric dam on Kwanza River',
        network_id: 'network-3',
        properties: { capacity: '2,070 MW', completed: 2020, type: 'Hydroelectric' },
        tags: ['energy', 'infrastructure', 'hydroelectric']
      },
      {
        type: 'location',
        title: 'Port of Luanda',
        description: 'Main port facility serving Angola',
        network_id: 'network-3',
        properties: { type: 'Deep Water Port', capacity: '6.1 million tons/year', vulnerability: 'Medium' },
        tags: ['shipping', 'trade', 'maritime']
      },
      {
        type: 'location',
        title: 'Benguela Railway',
        description: 'Strategic railway connecting Angola to neighboring countries',
        network_id: 'network-3',
        properties: { length: '1,344 km', rebuilt: 2014, connects: 'Atlantic to DRC/Zambia' },
        tags: ['transport', 'logistics', 'cross-border']
      },
      {
        type: 'organization',
        title: 'TAAG Angola Airlines',
        description: 'National airline of Angola',
        network_id: 'network-3',
        properties: { fleet: 18, founded: 1938, hubs: 'Luanda' },
        tags: ['aviation', 'state-owned', 'transport']
      },
      {
        type: 'program',
        title: 'Infrastructure Security Initiative',
        description: 'Program to protect critical infrastructure from cyber threats',
        network_id: 'network-3',
        properties: { established: 2021, focus: 'Cybersecurity', budget: '$24M' },
        tags: ['security', 'cyber', 'protection']
      }
    ];

    // Special Operations Network - Top Secret
    const specialOpsNetworkNodes = [
      {
        type: 'operation',
        title: 'Operation Diamond Shield',
        description: 'Covert operation to disrupt illegal diamond smuggling networks',
        network_id: 'network-4',
        properties: { status: 'Active', start_date: '2024-02-10', classification: 'Top Secret' },
        tags: ['active', 'covert', 'diamonds']
      },
      {
        type: 'operation',
        title: 'Operation Azure Waters',
        description: 'Maritime security operation in Gulf of Guinea',
        network_id: 'network-4',
        properties: { status: 'Active', focus: 'Anti-piracy', personnel: 120 },
        tags: ['maritime', 'security', 'piracy']
      },
      {
        type: 'person',
        title: 'Commander Phoenix',
        description: 'Special operations commander for regional operations',
        network_id: 'network-4',
        properties: { unit: 'Task Force 88', years_active: 15, specialization: 'Counter-terrorism' },
        tags: ['military', 'leadership', 'special_forces']
      },
      {
        type: 'location',
        title: 'Site Omega',
        description: 'Classified training facility for special operations',
        network_id: 'network-4',
        properties: { established: 2016, capacity: 'Classified', location: 'Classified' },
        tags: ['training', 'classified', 'special_forces']
      },
      {
        type: 'program',
        title: 'Project Silverback',
        description: 'Advanced weapons development program',
        network_id: 'network-4',
        properties: { phase: 'Testing', budget: 'Classified', start_year: 2022 },
        tags: ['weapons', 'research', 'development']
      }
    ];

    // Clear existing nodes and edges for clean slate
    await supabaseClient.from('knowledge_graph_edges').delete().neq('id', 'clear_all');
    await supabaseClient.from('knowledge_graph_nodes').delete().neq('id', 'clear_all');

    // Insert nodes for each network
    await supabaseClient.from('knowledge_graph_nodes').insert(defaultNetworkNodes);
    await supabaseClient.from('knowledge_graph_nodes').insert(humintNetworkNodes);
    await supabaseClient.from('knowledge_graph_nodes').insert(infraNetworkNodes);
    await supabaseClient.from('knowledge_graph_nodes').insert(specialOpsNetworkNodes);

    // Now create edges for each network
    // Default network
    const { data: defaultNodes } = await supabaseClient
      .from('knowledge_graph_nodes')
      .select('id, title')
      .eq('network_id', 'default');
    
    const defaultEdges = [
      {
        source: defaultNodes[0].id, // João Lourenço
        target: defaultNodes[1].id, // MPLA
        label: 'leads',
        network_id: 'default'
      },
      {
        source: defaultNodes[0].id, // João Lourenço
        target: defaultNodes[2].id, // Luanda
        label: 'governs from',
        network_id: 'default'
      },
      {
        source: defaultNodes[0].id, // João Lourenço
        target: defaultNodes[3].id, // Sonangol
        label: 'oversees',
        network_id: 'default'
      },
      {
        source: defaultNodes[4].id, // Adalberto Costa Júnior
        target: defaultNodes[1].id, // MPLA
        label: 'opposes',
        network_id: 'default'
      }
    ];
    await supabaseClient.from('knowledge_graph_edges').insert(defaultEdges);

    // HUMINT network
    const { data: humintNodes } = await supabaseClient
      .from('knowledge_graph_nodes')
      .select('id, title')
      .eq('network_id', 'network-2');
    
    const humintEdges = [
      {
        source: humintNodes[0].id, // Agent Cobra
        target: humintNodes[2].id, // Contact Alpha
        label: 'handles',
        network_id: 'network-2'
      },
      {
        source: humintNodes[1].id, // Agent Viper
        target: humintNodes[3].id, // Eagle Network
        label: 'manages',
        network_id: 'network-2'
      },
      {
        source: humintNodes[0].id, // Agent Cobra
        target: humintNodes[4].id, // Operation Sandstone
        label: 'participates in',
        network_id: 'network-2'
      },
      {
        source: humintNodes[1].id, // Agent Viper
        target: humintNodes[4].id, // Operation Sandstone
        label: 'participates in',
        network_id: 'network-2'
      }
    ];
    await supabaseClient.from('knowledge_graph_edges').insert(humintEdges);

    // Infrastructure network
    const { data: infraNodes } = await supabaseClient
      .from('knowledge_graph_nodes')
      .select('id, title')
      .eq('network_id', 'network-3');
    
    const infraEdges = [
      {
        source: infraNodes[4].id, // Infrastructure Security Initiative
        target: infraNodes[0].id, // Laúca Dam
        label: 'protects',
        network_id: 'network-3'
      },
      {
        source: infraNodes[4].id, // Infrastructure Security Initiative
        target: infraNodes[1].id, // Port of Luanda
        label: 'protects',
        network_id: 'network-3'
      },
      {
        source: infraNodes[1].id, // Port of Luanda
        target: infraNodes[2].id, // Benguela Railway
        label: 'connects to',
        network_id: 'network-3'
      },
      {
        source: infraNodes[3].id, // TAAG Angola Airlines
        target: infraNodes[1].id, // Port of Luanda
        label: 'transports to',
        network_id: 'network-3'
      }
    ];
    await supabaseClient.from('knowledge_graph_edges').insert(infraEdges);

    // Special Ops network
    const { data: opsNodes } = await supabaseClient
      .from('knowledge_graph_nodes')
      .select('id, title')
      .eq('network_id', 'network-4');
    
    const opsEdges = [
      {
        source: opsNodes[2].id, // Commander Phoenix
        target: opsNodes[0].id, // Operation Diamond Shield
        label: 'commands',
        network_id: 'network-4'
      },
      {
        source: opsNodes[2].id, // Commander Phoenix
        target: opsNodes[1].id, // Operation Azure Waters
        label: 'oversees',
        network_id: 'network-4'
      },
      {
        source: opsNodes[2].id, // Commander Phoenix
        target: opsNodes[3].id, // Site Omega
        label: 'operates from',
        network_id: 'network-4'
      },
      {
        source: opsNodes[4].id, // Project Silverback
        target: opsNodes[0].id, // Operation Diamond Shield
        label: 'supplies',
        network_id: 'network-4'
      },
      {
        source: opsNodes[4].id, // Project Silverback
        target: opsNodes[3].id, // Site Omega
        label: 'tested at',
        network_id: 'network-4'
      }
    ];
    await supabaseClient.from('knowledge_graph_edges').insert(opsEdges);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Knowledge graph networks successfully populated' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
