
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Toggle } from '@/components/ui/toggle';
import { RotateCw, RotateCcw, Flag, MapPin } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";

// List of African countries with their flags and coordinates
const africanCountries = [
  { name: 'Algeria', flag: 'dz', coordinates: [2.6327, 28.0339] },
  { name: 'Angola', flag: 'ao', coordinates: [17.8739, -11.2027] },
  { name: 'Benin', flag: 'bj', coordinates: [2.3158, 9.3077] },
  { name: 'Botswana', flag: 'bw', coordinates: [24.6849, -22.3285] },
  { name: 'Burkina Faso', flag: 'bf', coordinates: [-1.6880, 12.2383] },
  { name: 'Burundi', flag: 'bi', coordinates: [29.9189, -3.3731] },
  { name: 'Cabo Verde', flag: 'cv', coordinates: [-23.6051, 15.1201] },
  { name: 'Cameroon', flag: 'cm', coordinates: [12.3547, 7.3697] },
  { name: 'Central African Republic', flag: 'cf', coordinates: [20.9394, 6.6111] },
  { name: 'Chad', flag: 'td', coordinates: [18.7322, 15.4542] },
  { name: 'Comoros', flag: 'km', coordinates: [43.3333, -11.6455] },
  { name: 'Congo', flag: 'cg', coordinates: [15.2662, -0.2280] },
  { name: 'DR Congo', flag: 'cd', coordinates: [21.7587, -4.0383] },
  { name: 'Djibouti', flag: 'dj', coordinates: [42.5903, 11.8251] },
  { name: 'Egypt', flag: 'eg', coordinates: [30.8025, 26.8206] },
  { name: 'Equatorial Guinea', flag: 'gq', coordinates: [10.2679, 1.6508] },
  { name: 'Eritrea', flag: 'er', coordinates: [39.7823, 15.1794] },
  { name: 'Eswatini', flag: 'sz', coordinates: [31.4659, -26.5225] },
  { name: 'Ethiopia', flag: 'et', coordinates: [40.4897, 9.1450] },
  { name: 'Gabon', flag: 'ga', coordinates: [11.6094, -0.8037] },
  { name: 'Gambia', flag: 'gm', coordinates: [-15.3100, 13.4432] },
  { name: 'Ghana', flag: 'gh', coordinates: [-1.0232, 7.9465] },
  { name: 'Guinea', flag: 'gn', coordinates: [-9.6966, 9.9456] },
  { name: 'Guinea-Bissau', flag: 'gw', coordinates: [-15.1804, 11.8037] },
  { name: 'Ivory Coast', flag: 'ci', coordinates: [-5.5471, 7.5400] },
  { name: 'Kenya', flag: 'ke', coordinates: [37.9062, -0.0236] },
  { name: 'Lesotho', flag: 'ls', coordinates: [28.2336, -29.6100] },
  { name: 'Liberia', flag: 'lr', coordinates: [-9.4295, 6.4281] },
  { name: 'Libya', flag: 'ly', coordinates: [17.2283, 26.3351] },
  { name: 'Madagascar', flag: 'mg', coordinates: [46.8691, -18.7669] },
  { name: 'Malawi', flag: 'mw', coordinates: [34.3015, -13.2543] },
  { name: 'Mali', flag: 'ml', coordinates: [-3.9961, 17.5707] },
  { name: 'Mauritania', flag: 'mr', coordinates: [-10.9408, 21.0079] },
  { name: 'Mauritius', flag: 'mu', coordinates: [57.5522, -20.3484] },
  { name: 'Morocco', flag: 'ma', coordinates: [-7.0926, 31.7917] },
  { name: 'Mozambique', flag: 'mz', coordinates: [35.5296, -18.6657] },
  { name: 'Namibia', flag: 'na', coordinates: [18.4904, -22.9576] },
  { name: 'Niger', flag: 'ne', coordinates: [8.0817, 17.6078] },
  { name: 'Nigeria', flag: 'ng', coordinates: [8.6753, 9.0820] },
  { name: 'Rwanda', flag: 'rw', coordinates: [29.8739, -1.9403] },
  { name: 'Sao Tome and Principe', flag: 'st', coordinates: [6.6131, 0.1864] },
  { name: 'Senegal', flag: 'sn', coordinates: [-14.4524, 14.4974] },
  { name: 'Seychelles', flag: 'sc', coordinates: [55.4920, -4.6796] },
  { name: 'Sierra Leone', flag: 'sl', coordinates: [-11.7799, 8.4606] },
  { name: 'Somalia', flag: 'so', coordinates: [46.1996, 5.1521] },
  { name: 'South Africa', flag: 'za', coordinates: [22.9375, -30.5595] },
  { name: 'South Sudan', flag: 'ss', coordinates: [31.3070, 6.8770] },
  { name: 'Sudan', flag: 'sd', coordinates: [30.2176, 12.8628] },
  { name: 'Tanzania', flag: 'tz', coordinates: [34.8888, -6.3690] },
  { name: 'Togo', flag: 'tg', coordinates: [0.8248, 8.6195] },
  { name: 'Tunisia', flag: 'tn', coordinates: [9.5375, 33.8869] },
  { name: 'Uganda', flag: 'ug', coordinates: [32.2903, 1.3733] },
  { name: 'Zambia', flag: 'zm', coordinates: [27.8493, -13.1339] },
  { name: 'Zimbabwe', flag: 'zw', coordinates: [29.1549, -19.0154] }
];

// Key locations in Sudan with coordinates and descriptions
const sudanLocations = [
  { 
    name: 'Khartoum', 
    type: 'Capital City', 
    coordinates: [32.5599, 15.5007], 
    description: 'Capital and largest city of Sudan'
  },
  { 
    name: 'Port Sudan', 
    type: 'Port', 
    coordinates: [37.2164, 19.6175], 
    description: 'Major port city on the Red Sea'
  },
  { 
    name: 'Omdurman', 
    type: 'Major City', 
    coordinates: [32.4801, 15.6513], 
    description: 'Most populous city in Sudan'
  },
  { 
    name: 'Kassala', 
    type: 'City', 
    coordinates: [36.3994, 15.4548], 
    description: 'Eastern city near Eritrean border'
  },
  { 
    name: 'El Fasher', 
    type: 'City', 
    coordinates: [25.3494, 13.6279], 
    description: 'Capital of North Darfur state'
  },
  { 
    name: 'Nyala', 
    type: 'City', 
    coordinates: [24.8921, 12.0489], 
    description: 'Capital of South Darfur state'
  },
  { 
    name: 'Suakin', 
    type: 'Historic Port', 
    coordinates: [37.3321, 19.1059], 
    description: 'Historic port city on the Red Sea'
  }
];

const CountryButton = ({ country, isSelected, onClick }: { 
  country: { name: string; flag: string; coordinates: number[] }; 
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <button 
      className={`flex items-center justify-between w-full px-3 py-2 text-left hover:bg-slate-100 rounded transition-colors ${isSelected ? 'bg-slate-100' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <img 
          src={`https://flagcdn.com/24x18/${country.flag}.png`}
          srcSet={`https://flagcdn.com/48x36/${country.flag}.png 2x, https://flagcdn.com/72x54/${country.flag}.png 3x`} 
          width="24" 
          height="18"
          alt={`${country.name} flag`}
          className="rounded-sm shadow-sm"
        />
        <span className="text-sm font-medium">{country.name}</span>
      </div>
      {country.name === 'Sudan' && <Flag className="h-4 w-4 text-blue-500" />}
    </button>
  );
};

const MapTab: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [rotationEnabled, setRotationEnabled] = useState(false); // Start with rotation disabled until animation completes
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isAnimatingToCountry, setIsAnimatingToCountry] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map with the provided token
    mapboxgl.accessToken = 'pk.eyJ1IjoiamNkZW50b24yMDUxIiwiYSI6ImNtMzVkZXJudTA5ejkya3B5NDU4Z2MyeHQifQ.aUk4eH5k3JC45Foxcbe2qQ';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      projection: 'globe',
      zoom: 1.5,
      center: [0, 0], // Starting at [0,0] before animation
      pitch: 0, // Starting with flat view
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add atmosphere and fog effects for more realistic 3D appearance
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(255, 255, 255)',
        'high-color': 'rgb(200, 200, 225)',
        'horizon-blend': 0.2,
      });
      
      // Improved animation sequence to focus on Africa after the map loads
      setTimeout(() => {
        map.current?.flyTo({
          center: [20, 5], // Approximate center of African continent
          zoom: 2.8, // Slightly higher zoom to better frame Africa
          pitch: 20, // Add some pitch for better perspective
          duration: 6000, // Longer, smoother animation
          essential: true
        });
        
        // Enable rotation with a delay after flyTo animation completes
        setTimeout(() => {
          setRotationEnabled(true);
        }, 7000); // Wait 1 second after the flyTo animation (which takes 6 seconds)
      }, 2000); // Wait 2 seconds before starting the animation
    });

    // Cleanup function
    return () => {
      map.current?.remove();
      // Clear any existing markers
      clearMarkers();
    };
  }, []);

  // Function to clear existing markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  // Separate effect for handling rotation that depends on rotationEnabled state
  useEffect(() => {
    if (!map.current) return;
    
    // Rotation animation settings
    const secondsPerRevolution = 360; // Slower initial rotation (6 minutes per revolution)
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;
    let userInteracting = false;
    
    // Spin globe function
    function spinGlobe() {
      if (!map.current) return;
      
      const zoom = map.current.getZoom();
      if (rotationEnabled && !userInteracting && zoom < maxSpinZoom && !isAnimatingToCountry) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
          const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
          distancePerSecond *= zoomDif;
        }
        const center = map.current.getCenter();
        center.lng -= distancePerSecond;
        map.current.easeTo({ center, duration: 1000, easing: (n) => n });
      }
    }

    // Event listeners for interaction
    const handleMouseDown = () => {
      userInteracting = true;
    };
    
    const handleDragStart = () => {
      userInteracting = true;
    };
    
    const handleMouseUp = () => {
      userInteracting = false;
      if (rotationEnabled && !isAnimatingToCountry) spinGlobe();
    };
    
    const handleTouchEnd = () => {
      userInteracting = false;
      if (rotationEnabled && !isAnimatingToCountry) spinGlobe();
    };

    const handleMoveEnd = () => {
      if (rotationEnabled && !isAnimatingToCountry) spinGlobe();
    };

    // Add event listeners
    map.current.on('mousedown', handleMouseDown);
    map.current.on('dragstart', handleDragStart);
    map.current.on('mouseup', handleMouseUp);
    map.current.on('touchend', handleTouchEnd);
    map.current.on('moveend', handleMoveEnd);

    // Start spinning if enabled
    if (rotationEnabled && !isAnimatingToCountry) {
      spinGlobe();
    }

    // Set up interval for continuous rotation when enabled
    const rotationInterval = setInterval(() => {
      if (rotationEnabled && !isAnimatingToCountry) {
        spinGlobe();
      }
    }, 1000);

    // Cleanup event listeners and interval
    return () => {
      if (map.current) {
        map.current.off('mousedown', handleMouseDown);
        map.current.off('dragstart', handleDragStart);
        map.current.off('mouseup', handleMouseUp);
        map.current.off('touchend', handleTouchEnd);
        map.current.off('moveend', handleMoveEnd);
      }
      clearInterval(rotationInterval);
    };
  }, [rotationEnabled, isAnimatingToCountry]);

  // Create markers for Sudan locations when the country is selected
  const createSudanMarkers = () => {
    if (!map.current) return;
    
    // Clear any existing markers first
    clearMarkers();
    
    // Create markers for each location
    sudanLocations.forEach((location) => {
      // Create a DOM element for the marker
      const markerElement = document.createElement('div');
      markerElement.className = 'marker';
      markerElement.innerHTML = `<div class="flex flex-col items-center">
        <div class="text-red-600">
          ${MapPin}
        </div>
      </div>`;
      
      // Create a React element for the marker using lucide-react
      const markerNode = document.createElement('div');
      markerNode.className = 'marker-container';
      markerNode.style.color = '#e63946'; // Use a strong red color for visibility
      
      // Render the MapPin icon into the marker node
      const icon = document.createElement('div');
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
      markerNode.appendChild(icon);
      
      // Create the marker
      const marker = new mapboxgl.Marker({
        element: markerNode, 
        anchor: 'bottom'
      })
        .setLngLat(location.coordinates as [number, number]) // Cast to the required tuple type
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }) // Add a popup
            .setHTML(
              `<h3 class="font-medium text-sm">${location.name}</h3>
              <p class="text-xs text-gray-500">${location.type}</p>
              <p class="text-xs mt-1">${location.description}</p>`
            )
        )
        .addTo(map.current);
      
      // Store the marker reference for later cleanup
      markersRef.current.push(marker);
    });
  };

  const handleToggleRotation = () => {
    setRotationEnabled(!rotationEnabled);
  };

  const handleCountryClick = (country: typeof africanCountries[0]) => {
    setSelectedCountry(country.name);
    
    // Only allow Sudan to be selected
    if (country.name === 'Sudan' && map.current) {
      // Set animating state to prevent rotation during animation
      setIsAnimatingToCountry(true);
      
      // Turn off rotation when focusing on a country
      setRotationEnabled(false);
      
      // Fly to Sudan - ensure coordinates are properly typed as LngLatLike
      // LngLatLike requires [longitude, latitude] as a tuple or LngLat object
      const [longitude, latitude] = country.coordinates;
      
      map.current.flyTo({
        center: [longitude, latitude] as [number, number], // Explicitly cast as [number, number] tuple
        zoom: 5, // Zoom level for country view
        pitch: 30, // Add some pitch for better perspective
        duration: 3000, // Animation duration
        essential: true
      });
      
      // Add markers after animation completes
      map.current.once('moveend', () => {
        if (selectedCountry === 'Sudan') {
          createSudanMarkers();
        }
        // Reset animation state
        setIsAnimatingToCountry(false);
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Global Visualization</h2>
        <Toggle 
          pressed={rotationEnabled} 
          onPressedChange={handleToggleRotation} 
          aria-label="Toggle rotation"
          className="ml-2"
        >
          {rotationEnabled ? (
            <RotateCw className="h-4 w-4 mr-2" />
          ) : (
            <RotateCcw className="h-4 w-4 mr-2" />
          )}
          {rotationEnabled ? 'Rotation On' : 'Rotation Off'}
        </Toggle>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Interactive 3D globe visualization. Drag to rotate, scroll to zoom.
      </p>
      
      <ResizablePanelGroup direction="horizontal" className="border rounded-lg">
        <ResizablePanel defaultSize={75}>
          <div className="relative w-full h-[600px]">
            <div ref={mapContainer} className="absolute inset-0" />
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={25}>
          <div className="h-[600px] flex flex-col bg-white">
            <div className="p-4 border-b">
              <h3 className="font-medium">African Countries</h3>
              <p className="text-xs text-gray-500 mt-1">Click on Sudan to focus the map</p>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-1">
                {africanCountries.map((country) => (
                  <CountryButton
                    key={country.name}
                    country={country}
                    isSelected={selectedCountry === country.name}
                    onClick={() => handleCountryClick(country)}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default MapTab;
