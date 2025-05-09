
/**
 * Hook for formatting knowledge graph data
 */
export function useKnowledgeGraphFormatter() {
  // Helper function to properly format the properties for display
  const formatNodeProperties = (properties: any) => {
    if (!properties) return [];
    
    // Handle case where properties might be a string instead of an object
    let propertiesObj = properties;
    if (typeof properties === 'string') {
      try {
        propertiesObj = JSON.parse(properties);
      } catch (e) {
        console.error("Error parsing properties string:", e);
        return []; // Return empty array if parsing fails
      }
    }
    
    // Convert the properties object to an array of key-value pairs
    return Object.entries(propertiesObj).map(([key, value]) => ({ key, value }));
  };
  
  // Helper function to normalize classification levels for consistent handling
  const normalizeClassification = (classification: string): string => {
    if (!classification) return 'unclassified';
    return classification
      .toLowerCase()
      .replace(/[_\s-]+/g, '')
      .trim();
  };
  
  return {
    formatNodeProperties,
    normalizeClassification
  };
}
