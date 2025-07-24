"use client";
import { useState } from "react";
import { GoogleMap, useJsApiLoader, Autocomplete, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: -3.745,
  lng: -38.523,
};

export default function Home() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });

  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState(5);
  const [transportation, setTransportation] = useState("walking");
  const [duration, setDuration] = useState(30);
  const [companies, setCompanies] = useState<google.maps.places.PlaceResult[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<google.maps.places.PlaceResult | null>(null);
  const [configCollapsed, setConfigCollapsed] = useState(false);
  const [companyListCollapsed, setCompanyListCollapsed] = useState(false);
  const [thingsToKnowCollapsed, setThingsToKnowCollapsed] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [currentLocationMarker, setCurrentLocationMarker] = useState<google.maps.Marker | null>(null);
  const [activeTab, setActiveTab] = useState("Briefing");
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
          const type =
            companyType === "Custom"
              ? customCompanyType
              : companyType === "All"
              ? "software_company"
              : companyType.toLowerCase();
          service.nearbySearch(
            {
              location: { lat, lng },
              radius: radius * (radiusUnit === "km" ? 1000 : 1),
              type,
            },
            (results, status) => {
              if (status === "OK" && results) {
                const filteredCompanies = results.filter((company) => {
                  if (company.geometry?.location) {
                    const distance =
                      window.google.maps.geometry.spherical.computeDistanceBetween(
                        new window.google.maps.LatLng(lat, lng),
                        company.geometry.location
                      );
                    return distance <= radius * (radiusUnit === "km" ? 1000 : 1);
                  }
                  return false;
                });
                setCompanies(filteredCompanies);
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
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onLoad={(map) => setMap(map)}
          onClick={(e) => {
            if (e.latLng) {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              setLat(lat);
              setLng(lng);
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
              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === "OK" && results) {
                  setLocation(results[0].formatted_address);
                }
              });
              if (map) {
                map.setOptions({ draggableCursor: "" });
              }
            }
          }}
        >
          {companies.map((company) => (
            <Marker
              key={company.place_id}
              position={company.geometry?.location}
              onClick={() => {
                setSelectedCompany(company);
              }}
            />
          ))}
        </GoogleMap>
      ) : (
        <></>
      )}
      {configCollapsed ? (
        <div
          className="absolute top-1/2 left-0 transform -translate-y-1/2 h-5/6 w-12 bg-gradient-to-t from-blue-500 to-blue-700 text-white flex items-center justify-center cursor-pointer"
          onClick={() => setConfigCollapsed(false)}
        >
          <p className="transform rotate-90">Configuration</p>
        </div>
      ) : (
        <div className="absolute top-1/2 left-8 transform -translate-y-1/2 h-5/6 w-1/5 bg-gray-200 p-4 rounded-lg shadow-lg" style={{ backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.1)' }}>
          <button
            className="absolute top-2 right-2"
            onClick={() => setConfigCollapsed(true)}
          >
            X
          </button>
          <h2 className="text-lg font-bold mb-4">Configuration</h2>
          <div className="mb-4">
            <label htmlFor="location" className="block font-bold mb-2">
              Location
            </label>
            <Autocomplete>
              <input
                type="text"
                id="location"
                className="w-full border border-gray-400 p-2"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </Autocomplete>
            <button
              className="mt-2"
              onClick={() => {
                navigator.geolocation.getCurrentPosition((position) => {
                  const lat = position.coords.latitude;
                  const lng = position.coords.longitude;
                  setLat(lat);
                  setLng(lng);
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
                  const geocoder = new window.google.maps.Geocoder();
                  geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    if (status === "OK" && results) {
                      setLocation(results[0].formatted_address);
                    }
                  });
                });
              }}
            >
              O
            </button>
            <button
              className="mt-2"
              onClick={() => {
                if (map) {
                  map.setOptions({ draggableCursor: "crosshair" });
                }
              }}
            >
              Select from Map
            </button>
          </div>
          <div className="mb-4">
            <label htmlFor="radius" className="block font-bold mb-2">
              Search Radius
            </label>
            <div className="flex">
              <input
                type="number"
                id="radius"
                className="w-full border border-gray-400 p-2"
                value={radius}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1) {
                    setRadius(value);
                  }
                }}
              />
              <button
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded ml-2"
                onClick={() => {
                  if (radiusUnit === "km") {
                    setRadiusUnit("m");
                    setRadius(radius * 1000);
                  } else {
                    setRadiusUnit("km");
                    setRadius(radius / 1000);
                  }
                }}
              >
                {radiusUnit}
              </button>
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="companyType" className="block font-bold mb-2">
              Company Type
            </label>
            <select
              id="companyType"
              className="w-full border border-gray-400 p-2"
              value={companyType}
              onChange={(e) => setCompanyType(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Software">Software</option>
              <option value="Firmware">Firmware</option>
              <option value="Embedded">Embedded</option>
              <option value="Custom">Custom</option>
            </select>
            {companyType === "Custom" && (
              <input
                type="text"
                className="w-full border border-gray-400 p-2 mt-2"
                value={customCompanyType}
                onChange={(e) => setCustomCompanyType(e.target.value)}
              />
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="transportation" className="block font-bold mb-2">
              Transportation
            </label>
            <select
              id="transportation"
              className="w-full border border-gray-400 p-2"
              value={transportation}
              onChange={(e) => setTransportation(e.target.value)}
            >
              <option value="walking">Walking</option>
              <option value="2-wheeler">2-Wheeler</option>
              <option value="car">Car</option>
              <option value="public-transport">Public Transport</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="duration" className="block font-bold mb-2">
              Commute Duration (mins)
            </label>
            <select
              id="duration"
              className="w-full border border-gray-400 p-2"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
            >
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
              <option value="60">60</option>
            </select>
          </div>
          <div className="flex">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleSearch}
            >
              Search
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2"
              onClick={() => {
                setLocation("");
                setRadius(5);
                setTransportation("walking");
                setDuration(30);
                setCompanies([]);
                setLat(null);
                setLng(null);
              }}
            >
              Clear
            </button>
          </div>
        {lat && lng && (
          <div className="mt-4">
            <div>Longitude: {lng}</div>
            <div>Latitude: {lat}</div>
          </div>
        )}
        </div>
      )}
      {companyListCollapsed ? (
        <div
          className="absolute top-8 right-0 h-1/3 w-12 bg-gradient-to-t from-blue-500 to-blue-700 text-white flex items-center justify-center cursor-pointer"
          onClick={() => setCompanyListCollapsed(false)}
        >
          <p className="transform rotate-90">Company List</p>
        </div>
      ) : (
        <div className="absolute top-8 right-8 w-1/3 h-1/3 bg-white p-4 rounded-lg shadow-lg flex flex-col" style={{ backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.1)' }}>
          <div className="flex-shrink-0">
            <button
              className="absolute top-2 right-2"
              onClick={() => setCompanyListCollapsed(true)}
            >
              X
            </button>
            <h2 className="text-lg font-bold mb-4">Company List</h2>
          </div>
          <ul className="overflow-y-auto">
            {companies.map((company) => (
              <li
                key={company.place_id}
                onClick={() => setSelectedCompany(company)}
                className="cursor-pointer hover:bg-gray-200"
                onMouseEnter={() => {
                  if (map && company.geometry?.location) {
                    map.panTo(company.geometry.location);
                  }
                }}
              >
                {company.name}
              </li>
            ))}
          </ul>
        </div>
      )}
      {thingsToKnowCollapsed ? (
        <div
          className="absolute bottom-8 right-0 h-1/3 w-12 bg-gradient-to-t from-blue-500 to-blue-700 text-white flex items-center justify-center cursor-pointer"
          onClick={() => setThingsToKnowCollapsed(false)}
        >
          <p className="transform rotate-90">Things To Know</p>
        </div>
      ) : (
        <div className="absolute bottom-8 right-8 w-1/3 h-1/3 bg-white p-4 rounded-lg shadow-lg" style={{ backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.1)' }}>
          <button
            className="absolute top-2 right-2"
            onClick={() => setThingsToKnowCollapsed(true)}
          >
            X
          </button>
          <h2 className="text-lg font-bold mb-4">Things To Know</h2>
          {selectedCompany && (
            <div>
              <div className="flex">
                <button
                  className={`px-4 py-2 ${
                    activeTab === "Briefing" ? "bg-gray-400" : "bg-gray-300"
                  }`}
                  onClick={() => setActiveTab("Briefing")}
                >
                  Briefing
                </button>
                <button
                  className={`px-4 py-2 ${
                    activeTab === "People" ? "bg-gray-400" : "bg-gray-300"
                  }`}
                  onClick={() => setActiveTab("People")}
                >
                  People
                </button>
                <button
                  className={`px-4 py-2 ${
                    activeTab === "Connect" ? "bg-gray-400" : "bg-gray-300"
                  }`}
                  onClick={() => setActiveTab("Connect")}
                >
                  Connect
                </button>
                <button
                  className={`px-4 py-2 ${
                    activeTab === "Travel" ? "bg-gray-400" : "bg-gray-300"
                  }`}
                  onClick={() => setActiveTab("Travel")}
                >
                  Travel
                </button>
                <button
                  className={`px-4 py-2 ${
                    activeTab === "News" ? "bg-gray-400" : "bg-gray-300"
                  }`}
                  onClick={() => setActiveTab("News")}
                >
                  News
                </button>
              </div>
              <div className="p-4 bg-white">
                {activeTab === "Briefing" && (
                  <div>
                    <h2 className="text-lg font-bold">
                      {selectedCompany.name}
                    </h2>
                    <p>{selectedCompany.vicinity}</p>
                    <p>Rating: {selectedCompany.rating}</p>
                  </div>
                )}
                {activeTab === "People" && <div>People</div>}
                {activeTab === "Connect" && <div>Connect</div>}
                {activeTab === "Travel" && <div>Travel</div>}
                {activeTab === "News" && (
                  <div>
                    <ul>
                      <li>
                        <a href="#" target="_blank">
                          News Article 1
                        </a>
                      </li>
                      <li>
                        <a href="#" target="_blank">
                          News Article 2
                        </a>
                      </li>
                      <li>
                        <a href="#" target="_blank">
                          News Article 3
                        </a>
                      </li>
                      <li>
                        <a href="#" target="_blank">
                          News Article 4
                        </a>
                      </li>
                      <li>
                        <a href="#" target="_blank">
                          News Article 5
                        </a>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
