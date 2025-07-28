import { GoogleMap, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: -3.745,
  lng: -38.523,
};

interface MapProps {
  map: google.maps.Map | null;
  setMap: (map: google.maps.Map | null) => void;
  companies: google.maps.places.PlaceResult[];
  setSelectedCompany: (company: google.maps.places.PlaceResult | null) => void;
  setLat: (lat: number | null) => void;
  setLng: (lng: number | null) => void;
  setLocation: (location: string) => void;
  currentLocationMarker: google.maps.Marker | null;
  setCurrentLocationMarker: (marker: google.maps.Marker | null) => void;
}

const Map = ({
  map,
  setMap,
  companies,
  setSelectedCompany,
  setLat,
  setLng,
  setLocation,
  currentLocationMarker,
  setCurrentLocationMarker,
}: MapProps) => {
  return (
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
      {companies.map((company) => {
        const location = company.geometry?.location;
        const position =
          typeof location?.lat === "function" &&
          typeof location?.lng === "function"
            ? { lat: location.lat(), lng: location.lng() }
            : location; // in case it's already a plain object

        return (
          position && (
            <Marker
              key={company.place_id}
              position={position}
              onClick={() => setSelectedCompany(company)}
            />
          )
        );
      })}
    </GoogleMap>
  );
};

export default Map;
