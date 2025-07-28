"use client";
import { useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import Map from "../components/Map";
import ConfigurationPanel from "../components/ConfigurationPanel";
import CompanyList from "../components/CompanyList";
import CompanyDetails from "../components/CompanyDetails";

const LIBRARIES: (
  | "places"
  | "drawing"
  | "geometry"
  | "localContext"
  | "visualization"
)[] = ["places"];

export default function Home() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: LIBRARIES,
  });

  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState(5);
  const [transportation, setTransportation] = useState("walking");
  const [duration, setDuration] = useState(30);
  const [companies, setCompanies] = useState<google.maps.places.PlaceResult[]>(
    []
  );
  const [selectedCompany, setSelectedCompany] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [configCollapsed, setConfigCollapsed] = useState(false);
  const [companyListCollapsed, setCompanyListCollapsed] = useState(false);
  const [thingsToKnowCollapsed, setThingsToKnowCollapsed] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [currentLocationMarker, setCurrentLocationMarker] =
    useState<google.maps.Marker | null>(null);
  const [radiusUnit, setRadiusUnit] = useState("km");
  const [companyType, setCompanyType] = useState("All");
  const [customCompanyType, setCustomCompanyType] = useState("");

  const handleSearch = () => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: location }, (results, status) => {
      if (status === "OK" && results) {
        const lat = results[0].geometry?.location?.lat();
        const lng = results[0].geometry?.location?.lng();
        if (lat && lng) {
          setLat(lat);
          setLng(lng);

          // Move map and place marker
          if (map) {
            map.panTo({ lat, lng });
            map.setZoom(15);

            if (currentLocationMarker) {
              currentLocationMarker.setMap(null);
            }

            const marker = new window.google.maps.Marker({
              position: { lat, lng },
              map,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "blue",
                fillOpacity: 1,
                strokeWeight: 0,
              },
            });
            setCurrentLocationMarker(marker);
          }

          const service = new window.google.maps.places.PlacesService(
            document.createElement("div")
          );

          const query =
            companyType === "Custom"
              ? customCompanyType
              : companyType === "All"
              ? "software companies"
              : companyType.toLowerCase();

          // First try with textSearch for better accuracy
          service.textSearch(
            {
              location: { lat, lng },
              radius: radius * (radiusUnit === "km" ? 1000 : 1),
              query,
            },
            (textResults, textStatus) => {
              if (
                textStatus === google.maps.places.PlacesServiceStatus.OK &&
                textResults
              ) {
                const allResults = [...textResults];

                // Optional: run nearbySearch for broader discovery
                service.nearbySearch(
                  {
                    location: { lat, lng },
                    radius: radius * (radiusUnit === "km" ? 1000 : 1),
                    keyword: query,
                  },
                  (nearbyResults, nearbyStatus) => {
                    if (
                      nearbyStatus ===
                        google.maps.places.PlacesServiceStatus.OK &&
                      nearbyResults
                    ) {
                      // Deduplicate by place_id
                      const existingIds = new Set(
                        allResults.map((p) => p.place_id)
                      );
                      nearbyResults.forEach((p) => {
                        if (!existingIds.has(p.place_id)) {
                          allResults.push(p);
                        }
                      });
                    }
                    setCompanies(allResults);
                  }
                );
              } else {
                console.error("Text search failed:", textStatus);
                // Fallback to nearbySearch only
                service.nearbySearch(
                  {
                    location: { lat, lng },
                    radius: radius * (radiusUnit === "km" ? 1000 : 1),
                    keyword: query,
                  },
                  (nearbyResults, nearbyStatus) => {
                    if (
                      nearbyStatus ===
                        google.maps.places.PlacesServiceStatus.OK &&
                      nearbyResults
                    ) {
                      setCompanies(nearbyResults);
                    } else {
                      console.error("Nearby search also failed:", nearbyStatus);
                    }
                  }
                );
              }
            }
          );
        }
      }
    });
  };

  return (
    <div className="h-screen w-screen">
      {isLoaded ? (
        <Map
          map={map}
          setMap={setMap}
          companies={companies}
          setSelectedCompany={setSelectedCompany}
          setLat={setLat}
          setLng={setLng}
          setLocation={setLocation}
          currentLocationMarker={currentLocationMarker}
          setCurrentLocationMarker={setCurrentLocationMarker}
        />
      ) : (
        <></>
      )}
      <ConfigurationPanel
        configCollapsed={configCollapsed}
        setConfigCollapsed={setConfigCollapsed}
        location={location}
        setLocation={setLocation}
        radius={radius}
        setRadius={setRadius}
        radiusUnit={radiusUnit}
        setRadiusUnit={setRadiusUnit}
        companyType={companyType}
        setCompanyType={setCompanyType}
        customCompanyType={customCompanyType}
        setCustomCompanyType={setCustomCompanyType}
        transportation={transportation}
        setTransportation={setTransportation}
        duration={duration}
        setDuration={setDuration}
        handleSearch={handleSearch}
        setLat={setLat}
        setLng={setLng}
        map={map}
        currentLocationMarker={currentLocationMarker}
        setCurrentLocationMarker={setCurrentLocationMarker}
        setCompanies={setCompanies}
        isLoaded={isLoaded}
        lat={lat}
        lng={lng}
      />
      <CompanyList
        companyListCollapsed={companyListCollapsed}
        setCompanyListCollapsed={setCompanyListCollapsed}
        companies={companies}
        setSelectedCompany={setSelectedCompany}
        map={map}
      />
      <CompanyDetails
        thingsToKnowCollapsed={thingsToKnowCollapsed}
        setThingsToKnowCollapsed={setThingsToKnowCollapsed}
        selectedCompany={selectedCompany}
      />
    </div>
  );
}
