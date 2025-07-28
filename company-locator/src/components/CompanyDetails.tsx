import { useState } from "react";

interface CompanyDetailsProps {
  thingsToKnowCollapsed: boolean;
  setThingsToKnowCollapsed: (collapsed: boolean) => void;
  selectedCompany: google.maps.places.PlaceResult | null;
}

const CompanyDetails = ({
  thingsToKnowCollapsed,
  setThingsToKnowCollapsed,
  selectedCompany,
}: CompanyDetailsProps) => {
  const [activeTab, setActiveTab] = useState("Briefing");

  if (thingsToKnowCollapsed) {
    return (
      <div
        className={`group things-to-know ${
          thingsToKnowCollapsed
            ? "things-to-know-collapsed"
            : "things-to-know-expanded"
        }`}
        onClick={() => setThingsToKnowCollapsed(!thingsToKnowCollapsed)}
      >
        <p className="transform rotate-90 whitespace-nowrap">Things to Know</p>
      </div>
    );
  }

  return (
    <div
      className="absolute bottom-8 right-8 w-1/3 h-1/3 bg-white p-4 rounded-lg shadow-lg"
      style={{
        backdropFilter: "blur(10px)",
        background: "rgba(255, 255, 255, 0.1)",
      }}
    >
      <button
        className="absolute top-2 right-2 font-black text-[18px] mr-2"
        onClick={() => setThingsToKnowCollapsed(true)}
      >
        _
      </button>
      <h2 className="text-lg font-bold mb-4">Things To Know</h2>
      {selectedCompany && (
        <div>
          <div className="flex">
            <button
              className={`px-4 py-2 ${
                activeTab === "Briefing" ? "bg-ray-400" : "bg-gray-300"
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
                <h2 className="text-lg font-bold">{selectedCompany.name}</h2>
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
  );
};

export default CompanyDetails;
