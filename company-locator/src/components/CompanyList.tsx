interface CompanyListProps {
  companyListCollapsed: boolean;
  setCompanyListCollapsed: (collapsed: boolean) => void;
  companies: google.maps.places.PlaceResult[];
  setSelectedCompany: (company: google.maps.places.PlaceResult | null) => void;
  map: google.maps.Map | null;
}

const CompanyList = ({
  companyListCollapsed,
  setCompanyListCollapsed,
  companies,
  setSelectedCompany,
  map,
}: CompanyListProps) => {
  if (companyListCollapsed) {
    return (
      <div
        className={`group company-panel ${
          companyListCollapsed
            ? "company-panel-collapsed"
            : "company-panel-expanded"
        }`}
        onClick={() => setCompanyListCollapsed(!companyListCollapsed)}
      >
        <p className="transform rotate-90 whitespace-nowrap">Company List</p>
      </div>
    );
  }

  return (
    <div
      className="absolute top-8 right-8 w-1/3 h-1/3 bg-white p-4 rounded-lg shadow-lg flex flex-col"
      style={{
        backdropFilter: "blur(10px)",
        background: "rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="flex-shrink-0">
        <button
          className="absolute top-2 right-2 font-black text-[18px] mr-2"
          onClick={() => setCompanyListCollapsed(true)}
        >
          _
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
  );
};

export default CompanyList;
