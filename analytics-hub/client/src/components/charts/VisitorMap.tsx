/**
 * VISITOR MAP
 * Real-time visitor tracking with Mapbox GL JS
 */

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import styled from 'styled-components';

interface VisitorLocation {
  id: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  count: number;
  lastSeen: string;
  deviceType: string;
  browser: string;
}

interface VisitorMapProps {
  locations: VisitorLocation[];
  width?: number;
  height?: number;
  showClusters?: boolean;
  animated?: boolean;
  title?: string;
  subtitle?: string;
}

const MapContainer = styled(motion.div)`
  background: ${(props) => props.theme.colors.card};
  border-radius: 16px;
  padding: 24px;
  box-shadow: ${(props) => props.theme.neumorphic.shadowLight};
  position: relative;
  overflow: hidden;

  &:hover {
    box-shadow: ${(props) => props.theme.neumorphic.shadowDark};
  }
`;

const MapTitle = styled.h3`
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: ${(props) => props.theme.colors.text};
  margin: 0 0 8px 0;
`;

const MapSubtitle = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: ${(props) => props.theme.colors.text}80;
  margin: 0 0 16px 0;
`;

const MapWrapper = styled.div<{ width: number; height: number }>`
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
`;

const MapControls = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
`;

const ControlButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.05);
  }
`;

const Popup = styled.div`
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
  max-width: 200px;
`;

const PopupTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  color: ${(props) => props.theme.colors.text};
`;

const PopupInfo = styled.div`
  color: ${(props) => props.theme.colors.text}80;
  margin-bottom: 2px;
`;

export const VisitorMap: React.FC<VisitorMapProps> = ({
  locations,
  width = 600,
  height = 400,
  showClusters = true,
  animated = true,
  title,
  subtitle,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  // Set Mapbox access token (you'll need to get this from Mapbox)
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWxpY2Vzb2x1dGlvbnMiLCJhIjoiY2x4ZGV4ZGV4ZGV4In0.example'; // Replace with real token

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [-79.3832, 43.6532], // Toronto coordinates
      zoom: 10,
      attributionControl: false,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl({
      maxWidth: 100,
      unit: 'metric'
    }), 'bottom-left');

    // Add geolocate control
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    }), 'top-left');

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !locations.length) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    locations.forEach((location, index) => {
      if (animated) {
        // Animate marker appearance
        setTimeout(() => {
          addMarker(location);
        }, index * 100);
      } else {
        addMarker(location);
      }
    });

    // Fit map to show all markers
    if (locations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      locations.forEach(location => {
        bounds.extend([location.lng, location.lat]);
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  }, [locations, animated]);

  const addMarker = (location: VisitorLocation) => {
    if (!map.current) return;

    // Create custom marker element
    const el = document.createElement('div');
    el.className = 'visitor-marker';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.background = getMarkerColor(location.count);
    el.style.border = '2px solid white';
    el.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
    el.style.cursor = 'pointer';
    el.style.transition = 'all 0.3s ease';

    // Add hover effect
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.2)';
      el.style.zIndex = '1000';
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
      el.style.zIndex = '1';
    });

    // Create popup
    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: false,
      closeOnClick: false,
    }).setHTML(`
      <div style="font-family: 'Inter', sans-serif;">
        <div style="font-weight: 600; margin-bottom: 4px; color: #333;">
          ${location.city}, ${location.country}
        </div>
        <div style="color: #666; margin-bottom: 2px;">
          ${location.count} visitors
        </div>
        <div style="color: #666; margin-bottom: 2px;">
          ${location.deviceType} • ${location.browser}
        </div>
        <div style="color: #999; font-size: 10px;">
          Last seen: ${new Date(location.lastSeen).toLocaleTimeString()}
        </div>
      </div>
    `);

    // Create marker
    const marker = new mapboxgl.Marker(el)
      .setLngLat([location.lng, location.lat])
      .setPopup(popup)
      .addTo(map.current);

    markers.current.push(marker);
  };

  const getMarkerColor = (count: number): string => {
    if (count >= 100) return '#ff6b6b';
    if (count >= 50) return '#feca57';
    if (count >= 20) return '#48dbfb';
    if (count >= 10) return '#1dd1a1';
    return '#4a90e2';
  };

  const handleZoomIn = () => {
    if (map.current) {
      map.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map.current) {
      map.current.zoomOut();
    }
  };

  const handleFitBounds = () => {
    if (map.current && locations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      locations.forEach(location => {
        bounds.extend([location.lng, location.lat]);
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  };

  return (
    <MapContainer
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {title && <MapTitle>{title}</MapTitle>}
      {subtitle && <MapSubtitle>{subtitle}</MapSubtitle>}
      
      <MapWrapper width={width} height={height}>
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
        
        <MapControls>
          <ControlButton onClick={handleZoomIn} title="Zoom In">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </ControlButton>
          
          <ControlButton onClick={handleZoomOut} title="Zoom Out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13H5v-2h14v2z"/>
            </svg>
          </ControlButton>
          
          <ControlButton onClick={handleFitBounds} title="Fit to Data">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </ControlButton>
        </MapControls>
      </MapWrapper>
    </MapContainer>
  );
};
