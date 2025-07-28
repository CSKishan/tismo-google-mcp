export const searchCompanies = (
  map: google.maps.Map,
  lat: number,
  lng: number,
  radius: number,
  radiusUnit: string,
  companyType: string,
  customCompanyType: string
): Promise<google.maps.places.PlaceResult[]> => {
  return new Promise((resolve, reject) => {
    const service = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );

    const query =
      companyType === "Custom"
        ? customCompanyType
        : companyType === "All"
        ? "companies"
        : `${companyType} companies`;

    const searchBounds = new window.google.maps.Circle({
      center: { lat, lng },
      radius: radius * (radiusUnit === "km" ? 1000 : 1),
    }).getBounds();

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
                nearbyStatus === google.maps.places.PlacesServiceStatus.OK &&
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
              resolve(allResults);
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
                nearbyStatus === google.maps.places.PlacesServiceStatus.OK &&
                nearbyResults
              ) {
                resolve(nearbyResults);
              } else {
                console.error("Nearby search also failed:", nearbyStatus);
                reject(nearbyStatus);
              }
            }
          );
        }
      }
    );
  });
};
