import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches knowledge graph nodes from Supabase
 */
export async function getNodes(networkId = 'default') {
  try {
    console.log(`Fetching nodes for network: ${networkId}`);
    const { data, error } = await supabase
      .from('knowledge_graph_nodes')
      .select('*')
      .eq('network_id', networkId);
    
    if (error) {
      console.error('Error fetching knowledge graph nodes:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length} nodes for network ${networkId}`);
    return data;
  } catch (error) {
    console.error('Error fetching knowledge graph nodes:', error);
    return [];
  }
}

/**
 * Fetches knowledge graph edges from Supabase
 */
export async function getEdges(networkId = 'default') {
  try {
    console.log(`Fetching edges for network: ${networkId}`);
    const { data, error } = await supabase
      .from('knowledge_graph_edges')
      .select('*')
      .eq('network_id', networkId);
    
    if (error) {
      console.error('Error fetching knowledge graph edges:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length} edges for network ${networkId}`);
    return data;
  } catch (error) {
    console.error('Error fetching knowledge graph edges:', error);
    return [];
  }
}

/**
 * Fetches available knowledge graph networks
 */
export async function getNetworks() {
  try {
    console.log('Fetching all available knowledge graph networks');
    const { data, error } = await supabase
      .from('knowledge_graph_networks')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching knowledge graph networks:', error);
      throw error;
    }
    
    console.log('Retrieved networks from database:', data);
    
    // If we have networks from the database, return them
    if (data && data.length > 0) {
      return data;
    }
    
    // Otherwise, return default networks as fallback
    console.log('No networks found in database, using fallback data');
    return [
      { 
        id: 'default', 
        name: 'Default Intelligence Network', 
        classification: 'unclassified',
        description: 'Default intelligence network with entities and relationships'
      },
      {
        id: 'network-2',
        name: 'HUMINT Collection Network',
        classification: 'secret',
        description: 'Human Intelligence collection network with sources and agents'
      },
      {
        id: 'network-3',
        name: 'Critical Infrastructure Network',
        classification: 'secret',
        description: 'Network of critical infrastructure assets and vulnerabilities'
      },
      {
        id: 'network-4',
        name: 'Special Operations Network',
        classification: 'top_secret',
        description: 'Special operations network with classified missions'
      }
    ];
  } catch (error) {
    console.error('Error fetching knowledge graph networks:', error);
    // Return default network as fallback
    return [
      { 
        id: 'default', 
        name: 'Default Intelligence Network', 
        classification: 'unclassified',
        description: 'Default intelligence network with entities and relationships'
      },
      {
        id: 'network-2',
        name: 'HUMINT Collection Network',
        classification: 'secret',
        description: 'Human Intelligence collection network with sources and agents'
      },
      {
        id: 'network-3',
        name: 'Critical Infrastructure Network',
        classification: 'secret',
        description: 'Network of critical infrastructure assets and vulnerabilities'
      },
      {
        id: 'network-4',
        name: 'Special Operations Network',
        classification: 'top_secret',
        description: 'Special operations network with classified missions'
      }
    ];
  }
}

/**
 * Searches for nodes by title or description
 */
export async function searchNodes(searchTerm: string, networkId = 'default') {
  try {
    const { data, error } = await supabase
      .from('knowledge_graph_nodes')
      .select('*')
      .eq('network_id', networkId)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error searching knowledge graph nodes:', error);
    return [];
  }
}

/**
 * Gets all edges connected to a specific node
 */
export async function getNodeConnections(nodeId: string, networkId = 'default') {
  try {
    const { data, error } = await supabase
      .from('knowledge_graph_edges')
      .select('*, source_node:source(*), target_node:target(*)')
      .eq('network_id', networkId)
      .or(`source.eq.${nodeId},target.eq.${nodeId}`);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching node connections:', error);
    return [];
  }
}
