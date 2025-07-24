"use client";
import { useState } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

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
    googleMapsApiKey: process.env.googleMapsApiKey!,
  });

  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState(5);
  const [transportation, setTransportation] = useState("walking");
  const [duration, setDuration] = useState(30);
  const [companies, setCompanies] = useState<google.maps.places.PlaceResult[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<google.maps.places.PlaceResult | null>(null);

  const handleSearch = () => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: location }, (results, status) => {
      if (status === "OK" && results) {
        const lat = results[0].geometry?.location?.lat();
        const lng = results[0].geometry?.location?.lng();
        if (lat && lng) {
          const service = new window.google.maps.places.PlacesService(
            document.createElement("div")
          );
          service.nearbySearch(
            {
              location: { lat, lng },
              radius: radius * 1000,
              type: "software_company",
            },
            (results, status) => {
              if (status === "OK" && results) {
                setCompanies(results);
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
        >
          {/* Child components, such as markers, info windows, etc. */}
          <></>
        </GoogleMap>
      ) : (
        <></>
      )}
      <div className="absolute top-16 left-16 h-full w-1/5 bg-gray-200 p-2 rounded-lg shadow-lg" style={{ backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.1)' }}>
        <h2 className="text-lg font-bold mb-2">Configuration</h2>
        <div className="mb-2">
          <label htmlFor="location" className="block font-bold mb-2">
            Current Location
          </label>
          <input
            type="text"
            id="location"
            className="w-full border border-gray-400 p-2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="radius" className="block font-bold mb-2">
            Search Radius (km)
          </label>
          <input
            type="number"
            id="radius"
            className="w-full border border-gray-400 p-2"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
          />
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
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>
      <div className="absolute top-16 right-16 w-1/3 h-1/3 bg-white p-2 overflow-y-auto rounded-lg shadow-lg" style={{ backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.1)' }}>
        <h2 className="text-lg font-bold mb-2">Company List</h2>
        <ul>
          {companies.map((company) => (
            <li
              key={company.place_id}
              onClick={() => setSelectedCompany(company)}
              className="cursor-pointer hover:bg-gray-200"
            >
              {company.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute bottom-16 right-16 w-1/3 h-1/3 bg-white p-2 rounded-lg shadow-lg" style={{ backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.1)' }}>
        {selectedCompany && (
          <div>
            <div className="flex">
              <button className="px-4 py-2 bg-gray-400">Briefs</button>
              <button className="px-4 py-2 bg-gray-300">People</button>
              <button className="px-4 py-2 bg-gray-300">Connect</button>
              <button className="px-4 py-2 bg-gray-300">Commute</button>
              <button className="px-4 py-2 bg-gray-300">News</button>
            </div>
            <div className="p-4 bg-white">
              <h2 className="text-lg font-bold">{selectedCompany.name}</h2>
              <p>{selectedCompany.vicinity}</p>
              <p>Rating: {selectedCompany.rating}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
