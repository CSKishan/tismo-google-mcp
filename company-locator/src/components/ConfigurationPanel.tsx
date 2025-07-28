import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import Image from "next/image";
import { useEffect } from "react";

interface ConfigurationPanelProps {
  configCollapsed: boolean;
  setConfigCollapsed: (collapsed: boolean) => void;
  location: string;
  setLocation: (location: string) => void;
  radius: number;
  setRadius: (radius: number) => void;
  radiusUnit: string;
  setRadiusUnit: (unit: string) => void;
  companyType: string;
  setCompanyType: (type: string) => void;
  customCompanyType: string;
  setCustomCompanyType: (type: string) => void;
  transportation: string;
  setTransportation: (transportation: string) => void;
  duration: number;
  setDuration: (duration: number) => void;
  handleSearch: () => void;
  setLat: (lat: number | null) => void;
  setLng: (lng: number | null) => void;
  map: google.maps.Map | null;
  currentLocationMarker: google.maps.Marker | null;
  setCurrentLocationMarker: (marker: google.maps.Marker | null) => void;
  setCompanies: (companies: google.maps.places.PlaceResult[]) => void;
  isLoaded: boolean;
  lat: number | null;
  lng: number | null;
}

const ConfigurationPanel = ({
  configCollapsed,
  setConfigCollapsed,
  location,
  setLocation,
  radius,
  setRadius,
  radiusUnit,
  setRadiusUnit,
  companyType,
  setCompanyType,
  customCompanyType,
  setCustomCompanyType,
  transportation,
  setTransportation,
  duration,
  setDuration,
  handleSearch,
  setLat,
  setLng,
  map,
  currentLocationMarker,
  setCurrentLocationMarker,
  setCompanies,
  isLoaded,
  lat,
  lng,
}: ConfigurationPanelProps) => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 300,
    requestOptions: {
      types: ["geocode"],
    },
  });

  const handleSelect = async (description: string) => {
    setValue(description, false);
    clearSuggestions();
    setLocation(description);

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      setLat(lat);
      setLng(lng);
    } catch (error) {
      console.error("Error fetching coordinates for selected place", error);
    }
  };

  useEffect(() => {
    setValue(location);
  }, [location]);

  if (configCollapsed) {
    return (
      <div
        className={`group config-panel ${
          configCollapsed ? "config-panel-collapsed" : "config-panel-expanded"
        }`}
        onClick={() => setConfigCollapsed(!configCollapsed)}
      >
        <p className="config-panel-text transform rotate-90 whitespace-nowrap">
          Configuration
        </p>
      </div>
    );
  }

  return (
    <div
      className="absolute top-1/2 left-8 transform -translate-y-1/2 h-5/6 w-1/5 bg-gray-200 p-4 rounded-lg shadow-lg"
      style={{
        backdropFilter: "blur(10px)",
        background: "rgba(255, 255, 255, 0.1)",
      }}
    >
      <button
        className="absolute top-2 right-2 font-black text-[18px] mr-2"
        onClick={() => setConfigCollapsed(true)}
      >
        _
      </button>
      <h2 className="text-lg font-bold mb-4">Configuration</h2>
      <div className="mb-4">
        <div className="flex justify-between items-end">
          <label htmlFor="location" className="block font-bold mb-2">
            Location
          </label>
          <button
            className="simple-button"
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
                geocoder.geocode(
                  { location: { lat, lng } },
                  (results, status) => {
                    if (status === "OK" && results) {
                      setLocation(results[0].formatted_address);
                      setValue(results[0].formatted_address);
                    }
                  }
                );
              });
            }}
          >
            <Image
              src="/loc.png"
              alt="current-location"
              width={50}
              height={50}
            />
          </button>
        </div>
        <input
          id="location"
          className="w-full border border-gray-400 p-2"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setLocation(e.target.value);
          }}
          disabled={!ready}
          placeholder="Enter a location"
        />
        {status === "OK" && (
          <div className="border border-gray-300 mt-1 max-h-40 overflow-y-auto bg-white z-10 shadow-md rounded-md">
            {data.map(({ place_id, description }) => (
              <div
                key={place_id}
                className="px-4 py-2 hover:bg-gray-200 cursor-pointer text-black"
                onClick={() => handleSelect(description)}
              >
                {description}
              </div>
            ))}
          </div>
        )}
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
      <div className="flex justify-between">
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
        <div className="mt-2 bottom-4 absolute w-[90%]">
          <div className="flex justify-between">
            <span>Longitude:</span>
            <span className="font-semibold text-blue-500">{lng}</span>
          </div>
          <div className="flex justify-between">
            <span>Latitude:</span>
            <span className="font-semibold text-blue-400">{lat}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationPanel;
