"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Clock,
  Edit3,
  Phone,
  MessageSquare,
  X,
  User,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Car,
} from "lucide-react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import LostAndFoundForm from "../../Components/LostAndFoundForm"; // Import the form component

export default function LostAndFound() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState("Admin");
  const [filteredItems, setFilteredItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    vehicleMake: "",
    vehicleModel: "",
    numberPlate: "",
  });
  const [isFormOpen, setIsFormOpen] = useState(false); // State to manage form visibility
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data from the API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "http://localhost:3000/api/lost-and-found/admin/all"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const processedItems = data.data.map((item) => ({
          ...item,
          userType: item.user.fname === "Admin" ? "Admin" : "User",
        }));

        setItems(processedItems || []);
        setFilteredItems(processedItems || []);
      } catch (err) {
        console.error("Error fetching lost and found items:", err);
        setError(err.message);
        toast.error(`Failed to load items: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...items];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.make &&
            item.make
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (item.model &&
            item.model
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (item.nplate &&
            item.nplate.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (userFilter) {
      filtered = filtered.filter(
        (item) => item.userType.toLowerCase() === userFilter.toLowerCase()
      );
    }

    if (statusFilter) {
      if (statusFilter === "lost") {
        filtered = filtered.filter((item) => item.type === "lost");
      } else if (statusFilter === "found") {
        filtered = filtered.filter((item) => item.type === "found");
      } else if (statusFilter === "resolved") {
        filtered = filtered.filter((item) => item.status !== "active");
      }
    }

    setFilteredItems(filtered);
  }, [searchTerm, userFilter, statusFilter, items]);

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Status helpers
  const getStatusColor = (type) => {
    switch (type) {
      case "lost":
        return "bg-yellow-100 text-yellow-800";
      case "found":
        return "bg-green-100 text-green-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case "lost":
        return <Clock className="w-4 h-4 mr-1" />;
      case "found":
        return <CheckCircle className="w-4 h-4 mr-1" />;
      default:
        return <XCircle className="w-4 h-4 mr-1" />;
    }
  };

  // Update item status
  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/lost-and-found/resolve/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.message}`);
      }
      const updatedItem = await response.json();
      // setItems(items.map((item) => (item.id === id ? {...updatedItem.data} : item)))

      window.location.reload();

      toast.success(`Item status updated`);
    } catch (err) {
      console.error("Error updating item status:", err);
      toast.error(`Failed to update status: ${err.message}`);
    }
  };
  // Delete item
  const deleteItem = async () => {
    if (!itemToDelete) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `http://localhost:3000/api/lost-and-found/${itemToDelete.id}`, // Updated endpoint
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(errorDetails || "Delete failed");
      }

      const data = await response.json();

      // Update local state
      setItems(items.filter((item) => item.id !== itemToDelete.id));
      setShowDeleteConfirm(false);

      toast.success(data.message || "Item deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete item");
    } finally {
      setIsLoading(false);
      setItemToDelete(null);
    }
  };

  // Add new item
  const handleAddItemSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const uid = Cookies.get("sauto")?.split("-")[0];
      if (!uid) {
        toast.error("User ID is missing. Please log in again.");
        return;
      }

      formData.append("id", uid);
      const response = await fetch("http://localhost:3000/api/lost-and-found", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Details: ${errorDetails}`
        );
      }

      const data = await response.json();
      if (data.success) {
        const newItem = {
          ...data.item,
          userType: data.item.user.fname === "Admin" ? "Admin" : "User",
        };
        toast.success("Item added successfully!");
        setItems([...items, newItem]);
        setShowAddItem(false);
      } else {
        toast.error("Failed to add the item. Please try again.");
      }
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error(`Failed to add item: ${error.message}`);
    }
  };

  // Handle update data
  const handleUpdateData = async (itemId) => {
    if (!updatedData) {
      toast.error("No item selected");
      return;
    }
    if (!itemId) {
      toast.error("No item ID provided");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/lost-and-found/edit/${itemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: updatedData.title,
            description: updatedData.description,
            location: updatedData.location,
            date: updatedData.date,
            vehicleMake: updatedData.vehicleMake,
            vehicleModel: updatedData.vehicleModel,
            numberPlate: updatedData.numberPlate,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update item");
      }

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, ...updatedData } : item
        )
      );

      toast.success("Item updated successfully");
      setUpdatedData(null);
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || "Error updating item");
    }
  };

  // Permission helpers
  const canEdit = (item) => currentUserRole === "Admin";
  const canContact = (item) => item.user.fname === "User" && item.user.num;

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setUserFilter("");
    setStatusFilter("");
    setShowFilters(false);
  };

  return (
    <div className="flex-1 ml-0 md:ml-64 min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="mb-6 md:mb-8">
          <div className="border-l-4 border-[#ff6b00] pl-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Lost and Found
            </h1>
          </div>
        </div>

        {/* Search and Add Button - Always visible */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 whitespace-nowrap"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Item</span>
            </button>
          </div>
        </div>

        {/* Filters - Collapsible on mobile */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Type
                </label>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Users</option>
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="lost">Lost</option>
                  <option value="found">Found</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full sm:w-auto px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LostAndFoundForm Popup */}
      <LostAndFoundForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={(newItem) => {
          setItems([...items, newItem]);
          setIsFormOpen(false);
        }}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 mx-4 sm:mx-6 md:mx-8"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredItems.length === 0 && (
        <div className="text-center py-12 px-4">
          <div className="text-gray-500 mb-4">
            <AlertTriangle className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || userFilter || statusFilter
              ? "Try adjusting your search or filters"
              : "Start by adding a lost or found item"}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Item
            </button>
          </div>
        </div>
      )}

      {/* Items Grid */}
      {!isLoading && !error && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-6 md:px-8">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                <img
                  src={
                    (item.images &&
                      item.images[0] &&
                      `../../server${
                        item.images[0].imageUrl || "/placeholder.svg"
                      }`) ||
                    "/placeholder.svg"
                  }
                  alt={item.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg";
                  }}
                />
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                      {item.title}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        item.type
                      )}`}
                    >
                      {getStatusIcon(item.type)}
                      <span className="ml-1">{item.type.toUpperCase()}</span>
                    </span>
                  </div>
                  <div className="flex gap-1 sm:gap-2">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </button>

                    {canEdit(item) && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setSelectedItemId(item.id);
                          setUpdatedData({
                            title: item.title,
                            description: item.description,
                            location: item.location,
                            date: item.date,
                            vehicleMake: item.make,
                            vehicleModel: item.model,
                            numberPlate: item.nplate,
                          });
                        }}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full"
                        title="Edit Item"
                      >
                        <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      </button>
                    )}

                    {canEdit(item) && (
                      <button
                        onClick={() => {
                          setItemToDelete(item);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      </button>
                    )}

                    {item.status === "active" && (
                      <button
                        onClick={() => updateStatus(item.id, "resolved")}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full"
                        title="Mark as Resolved"
                      >
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm sm:text-base">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  {item.make && (
                    <div className="flex items-center text-gray-600">
                      <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <span>
                        {item.make} {item.model}
                        {item.nplate && ` (${item.nplate})`}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                    <span>Posted by: {item.user.fname}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination - Responsive */}
      {filteredItems.length > 0 && (
        <div className="flex justify-center mt-8 mb-8 px-4">
          <div className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-2 sm:px-4 py-2 border-r border-gray-200 flex items-center ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="hidden sm:flex">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-4 py-2 border-r border-gray-200 ${
                      currentPage === number
                        ? "bg-orange-500 text-white font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {number}
                  </button>
                )
              )}
            </div>

            <div className="sm:hidden px-4 py-2 text-sm">
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-2 sm:px-4 py-2 flex items-center ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Edit modal - Responsive */}
      {isEditing && updatedData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Edit Item
              </h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setUpdatedData({
                    title: "",
                    description: "",
                    location: "",
                    date: "",
                    vehicleMake: "",
                    vehicleModel: "",
                    numberPlate: "",
                  });
                }}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
              </button>
            </div>

            <div className="mb-4">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={updatedData.title}
                className="mt-1 p-2 border-[1px] block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                onChange={(e) => {
                  setUpdatedData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }));
                }}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={updatedData.description}
                onChange={(e) => {
                  setUpdatedData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }));
                }}
                rows="3"
                className="mt-1 p-2 border-[1px] block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              ></textarea>
            </div>

            <div className="mb-4">
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                value={updatedData.location}
                onChange={(e) => {
                  setUpdatedData((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }));
                }}
                name="location"
                className="mt-1 p-2 border-[1px] block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700"
              >
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                onChange={(e) => {
                  setUpdatedData((prev) => ({
                    ...prev,
                    date: new Date(e.target.value).toISOString(),
                  }));
                }}
                value={
                  updatedData.date
                    ? new Date(updatedData.date).toISOString().split("T")[0]
                    : ""
                }
                className="mt-1 p-2 border-[1px] block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="vehicleMake"
                className="block text-sm font-medium text-gray-700"
              >
                Vehicle Make
              </label>
              <input
                type="text"
                id="vehicleMake"
                name="vehicleMake"
                value={updatedData.vehicleMake}
                onChange={(e) => {
                  setUpdatedData((prev) => ({
                    ...prev,
                    vehicleMake: e.target.value,
                  }));
                }}
                className="mt-1 p-2 border-[1px] block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="vehicleModel"
                className="block text-sm font-medium text-gray-700"
              >
                Vehicle Model
              </label>
              <input
                type="text"
                id="vehicleModel"
                name="vehicleModel"
                value={updatedData.vehicleModel || ""}
                onChange={(e) => {
                  setUpdatedData((prev) => ({
                    ...prev,
                    vehicleModel: e.target.value,
                  }));
                }}
                className="mt-1 p-2 border-[1px] block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="numberPlate"
                className="block text-sm font-medium text-gray-700"
              >
                Number Plate
              </label>
              <input
                type="text"
                id="numberPlate"
                name="numberPlate"
                value={updatedData.numberPlate || ""}
                onChange={(e) => {
                  setUpdatedData((prev) => ({
                    ...prev,
                    numberPlate: e.target.value,
                  }));
                }}
                className="mt-1 p-2 border-[1px] block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <button
                onClick={() => handleUpdateData(selectedItemId)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal - Responsive */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-6 md:mt-0">
              <div className="order-2 md:order-1">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 pr-8 sm:pr-0">
                  {selectedItem.title}
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-gray-600 text-sm">Location</h3>
                    <p className="text-lg sm:text-xl font-medium">
                      {selectedItem.location}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-gray-600 text-sm">Date</h3>
                    <p className="text-lg sm:text-xl font-medium">
                      {new Date(selectedItem.date).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedItem.make && (
                    <div>
                      <h3 className="text-gray-600 text-sm">Vehicle Make</h3>
                      <p className="text-lg sm:text-xl font-medium">
                        {selectedItem.make}
                      </p>
                    </div>
                  )}
                  {selectedItem.model && (
                    <div>
                      <h3 className="text-gray-600 text-sm">Vehicle Model</h3>
                      <p className="text-lg sm:text-xl font-medium">
                        {selectedItem.model}
                      </p>
                    </div>
                  )}
                  {selectedItem.nplate && (
                    <div>
                      <h3 className="text-gray-600 text-sm">Number Plate</h3>
                      <p className="text-lg sm:text-xl font-medium">
                        {selectedItem.nplate}
                      </p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-gray-600 text-sm">Description</h3>
                    <p className="text-gray-700">{selectedItem.description}</p>
                  </div>
                  <div>
                    <h3 className="text-gray-600 text-sm">Status</h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        selectedItem.type
                      )}`}
                    >
                      {getStatusIcon(selectedItem.type)}
                      <span className="ml-1">
                        {selectedItem.type.toUpperCase()}
                      </span>
                    </span>
                  </div>
                  <div>
                    <h3 className="text-gray-600 text-sm">Reporter</h3>
                    <p className="text-gray-700">
                      {selectedItem.user.fname}
                      {selectedItem.user.num && canContact(selectedItem) && (
                        <span className="ml-2 text-sm text-blue-600">
                          {selectedItem.user.num}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="order-1 md:order-2">
                <div className="relative bg-gray-100 rounded-lg">
                  <img
                    src={
                      (selectedItem.images &&
                        selectedItem.images[0] &&
                        `../../server${
                          selectedItem.images[0].imageUrl || "/placeholder.svg"
                        }`) ||
                      "/placeholder.svg"
                    }
                    alt={selectedItem.name}
                    className="w-full h-[250px] sm:h-[300px] md:h-[350px] object-contain rounded-lg"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg";
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6 sm:mt-8 justify-center sm:justify-end">
              {canContact(selectedItem) && (
                <>
                  <button
                    onClick={() =>
                      (window.location.href = `tel:${selectedItem.user.num}`)
                    }
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                    Call Reporter
                  </button>
                  <button
                    onClick={() =>
                      (window.location.href = `sms:${selectedItem.user.num}`)
                    }
                    className="flex items-center gap-2 bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                  >
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                    SMS Reporter
                  </button>
                </>
              )}

              {canEdit(selectedItem) && (
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setIsEditing(true);
                    setSelectedItemId(selectedItem.id);
                    setUpdatedData({
                      title: selectedItem.title,
                      description: selectedItem.description,
                      location: selectedItem.location,
                      date: selectedItem.date,
                      vehicleMake: selectedItem.vehicleMake || "",
                      vehicleModel: selectedItem.vehicleModel || "",
                      numberPlate: selectedItem.numberPlate || "",
                    });
                  }}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                >
                  <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Edit Item
                </button>
              )}

              <button
                onClick={() => setSelectedItem(null)}
                className="bg-gray-100 text-gray-800 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Responsive */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Delete
            </h2>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete "{itemToDelete?.title}"?
            </p>
            <div className="flex justify-end gap-3 sm:gap-4">
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-medium py-2 px-3 sm:px-4 rounded focus:outline-none focus:shadow-outline text-sm"
                type="button"
                onClick={deleteItem}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-3 sm:px-4 rounded focus:outline-none focus:shadow-outline text-sm"
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
