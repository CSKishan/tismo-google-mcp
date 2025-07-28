interface CompanyListProps {
  companyListCollapsed: boolean;
  setCompanyListCollapsed: (collapsed: boolean) => void;
  companies: google.maps.places.PlaceResult[];
  setSelectedCompany: (company: google.maps.places.PlaceResult | null) => void;
  map: google.maps.Map | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const CompanyList = ({
  companyListCollapsed,
  setCompanyListCollapsed,
  companies,
  setSelectedCompany,
  map,
  currentPage,
  setCurrentPage,
  searchTerm,
  setSearchTerm,
}: CompanyListProps) => {
  const companiesPerPage = 20;
  const filteredCompanies = companies.filter((company) =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * companiesPerPage,
    currentPage * companiesPerPage
  );

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
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-bold mr-5">Company List</h2>
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-400 p-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <ul className="overflow-y-auto">
        {paginatedCompanies.map((company) => (
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
      {Math.ceil(filteredCompanies.length / companiesPerPage) > 1 && (
        <div className="flex justify-between mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of{" "}
            {Math.ceil(filteredCompanies.length / companiesPerPage)}
          </span>
          <button
            disabled={
              currentPage ===
              Math.ceil(filteredCompanies.length / companiesPerPage)
            }
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CompanyList;
