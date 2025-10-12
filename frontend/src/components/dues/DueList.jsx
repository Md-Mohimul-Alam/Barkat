import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useSearchParams, Link } from "react-router-dom";
import TopBar from "../shared/Topbar";
import SidebarWrapper from "../shared/Sidebar";
import Footer from "../shared/Footer";
import axios from "axios";

const DueList = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [searchParams] = useSearchParams();

  const clientId = searchParams.get("clientId");
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDues = async () => {
      try {
        const url = clientId
          ? `http://localhost:5050/api/dues?clientId=${clientId}`
          : `http://localhost:5050/api/dues`;
        const response = await axios.get(url);
        setDues(response.data);
      } catch (error) {
        console.error("Error fetching dues:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDues();
  }, [clientId]);

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center h-screen ${
          isDark ? "bg-cyan-950 text-[#ffffff]" : "bg-[#ffffff] text-gray-900"
        } transition-all duration-300`}
      >
        <p>Loading dues...</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex ${
        isDark ? "bg-cyan-950 text-[#ffffff]" : "bg-[#ffffff] text-gray-900"
      } transition-all duration-300`}
    >
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
          sidebarCollapsed={sidebarCollapsed}
        />

        <div className="p-6 mb-10 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {clientId ? `Dues for Client #${clientId}` : "All Dues"}
            </h1>
            <Link
              to="/app/dues/add"
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                isDark
                  ? "bg-[#f85924] hover:bg-[#d13602] text-white shadow-lg"
                  : "bg-[#f85924] hover:bg-[#d13602] text-white shadow-md"
              }`}
            >
              + Add Due
            </Link>
          </div>

          <div className="overflow-x-auto rounded-lg shadow-lg">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr
                  className={`${
                    isDark ? "bg-[#2C2C2C] text-[#ffffff]" : "bg-white text-gray-700"
                  } border-b ${isDark ? 'border-[#457B9D]' : 'border-gray-200'}`}
                >
                  <th className="p-4 text-left font-semibold">Description</th>
                  <th className="p-4 text-left font-semibold">Amount</th>
                  <th className="p-4 text-left font-semibold">Due Date</th>
                  <th className="p-4 text-left font-semibold">Client ID</th>
                  <th className="p-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dues.length > 0 ? (
                  dues.map((due, index) => (
                    <tr
                      key={due.id}
                      className={`transition-colors duration-150 ${
                        isDark 
                          ? `bg-sky-950 hover:bg-[#0E2A45] ${index !== dues.length - 1 ? 'border-b border-[#457B9D]' : ''}`
                          : `bg-white hover:bg-gray-50 ${index !== dues.length - 1 ? 'border-b border-gray-200' : ''}`
                      }`}
                    >
                      <td className="p-4">{due.description}</td>
                      <td className="p-4">{due.amount}</td>
                      <td className="p-4">
                        {new Date(due.dueDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">{due.clientId}</td>
                      <td className="p-4 text-center">
                        <Link
                          to={`/app/dues/edit/${due.id}`}
                          className={`text-sm font-medium px-3 py-1 rounded transition-colors duration-200 ${
                            isDark 
                              ? 'text-[#f85924] hover:text-[#d13602] hover:bg-[#2C2C2C]' 
                              : 'text-[#1D3557] hover:text-[#457B9D] hover:bg-blue-50'
                          }`}
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className={`p-4 text-center ${
                        isDark ? "text-[#A8A8A8]" : "text-gray-500"
                      }`}
                    >
                      No dues found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default DueList;