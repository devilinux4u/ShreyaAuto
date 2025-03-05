"use client";

import { useState, useEffect } from "react";
import {
  Car,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Calendar,
  Loader2,
  AlertCircle,
  DollarSign,
  Clock,
  Users,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

export default function AdminRentalVehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [postedByFilter, setPostedByFilter] = useState("all");
  const [sortByFilter, setSortByFilter] = useState("default");

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedVehicleData, setUpdatedVehicleData] = useState({
    make: "",
    model: "",
    year: "",
    price: { hour: 0, day: 0, week: 0, month: 0 },
    specs: {
      seats: 0,
      doors: 0,
      transmission: "",
      fuel: "",
      mileage: 0,
      engine: "",
      power: 0,
    },
    features: "",
    description: "",
    numberPlate: "",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewedVehicle, setViewedVehicle] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost:3000/api/vehicles");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const { data } = await response.json();

      const transformedVehicles = data.map((vehicle) => ({
        _id: vehicle.id.toString(),
        make: vehicle.make || "Unknown",
        model: vehicle.model || "Unknown",
        year: vehicle.year || new Date().getFullYear(),
        price: {
          hour: vehicle.priceHour || 0,
          day: vehicle.priceDay || 0,
          week: vehicle.priceWeek || 0,
          month: vehicle.priceMonth || 0,
        },
        specs: {
          seats: vehicle.seats || 4,
          doors: vehicle.doors || 4,
          transmission: vehicle.transmission || "Automatic",
          fuel: vehicle.fuelType || "Petrol",
          mileage: vehicle.mileage || 0,
          engine: vehicle.engine || "N/A",
          power: vehicle.power || 0,
        },
        features: vehicle.features || "N/A",
        description: vehicle.description || "N/A",
        // Update this line to match the alias from your backend
        imagePreviewUrls: vehicle.rentVehicleImages
          ? vehicle.rentVehicleImages.map((img) =>
              img.image.startsWith("http")
                ? img.image
                : `http://localhost:3000/uploads/${img.image}`
            )
          : ["/placeholder.svg"],
        createdAt: vehicle.createdAt || new Date().toISOString(),
        status: vehicle.status || "available",
        postedBy: "admin",
        numberPlate: vehicle.numberPlate || "N/A",
        vehicle_images: vehicle.rentVehicleImages || [], // Update this reference too
      }));

      setVehicles(transformedVehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setError(error.message);
      toast.error(`Failed to load vehicles: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/vehicles/${id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        setVehicles(vehicles.filter((vehicle) => vehicle._id !== id));
        toast.success("Vehicle deleted successfully");
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        toast.error(error.message || "Failed to delete vehicle");
      }
    }
  };

  const handleAddNew = () => {
    navigate("/admin/addvehicle");
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setUpdatedVehicleData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price,
      specs: vehicle.specs,
      features: vehicle.features,
      description: vehicle.description,
      numberPlate: vehicle.numberPlate,
    });
    setIsEditModalOpen(true);
  };

  const handleView = (vehicle) => {
    setViewedVehicle(vehicle);
    setIsViewModalOpen(true);
  };

  const handleUpdateVehicle = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/vehicles/${selectedVehicle._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedVehicleData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update vehicle");
      }

      const updatedVehicle = await response.json();
      setVehicles((prevVehicles) =>
        prevVehicles.map((vehicle) =>
          vehicle._id === selectedVehicle._id ? updatedVehicle : vehicle
        )
      );
      setIsEditModalOpen(false);
      toast.success("Vehicle updated successfully");
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast.error("Failed to update vehicle");
    }
  };

  const filteredVehicles = vehicles
    .filter((vehicle) => {
      const searchMatch =
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.year.toString().includes(searchTerm) ||
        vehicle.numberPlate.toLowerCase().includes(searchTerm.toLowerCase());

      const postedByMatch =
        postedByFilter === "all" ||
        (postedByFilter === "admin" && vehicle.postedBy === "admin") ||
        (postedByFilter === "user" && vehicle.postedBy !== "admin");

      return searchMatch && postedByMatch;
    })
    .sort((a, b) => {
      switch (sortByFilter) {
        case "date-latest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "date-oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "price-high":
          return (
            Number.parseFloat(b.price.day) - Number.parseFloat(a.price.day)
          );
        case "price-low":
          return (
            Number.parseFloat(a.price.day) - Number.parseFloat(b.price.day)
          );
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const FilterButton = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? "bg-indigo-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );

  return (
    <>
      <ToastContainer position="top-right" theme="colored" />
      <div className="flex-1 ml-0 md:ml-64 min-h-screen bg-gray-50">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-6 md:mb-8">
            <div className="border-l-4 border-[#ff6b00] pl-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Rental Vehicles
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your rental vehicle inventory
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md mb-6">
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-auto flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search vehicles by make, model, year or plate..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b00] focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button
                onClick={handleAddNew}
                className="flex items-center px-4 py-2 bg-[#ff6b00] text-white rounded-lg hover:bg-[#ff8533] transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                <span>Add Vehicle</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md mb-6 p-5">
            <div className="flex items-center mb-4">
              <Filter className="h-5 w-5 mr-2 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Sort By</h2>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex flex-wrap gap-2">
                  <FilterButton
                    active={sortByFilter === "default"}
                    onClick={() => setSortByFilter("default")}
                  >
                    Default
                  </FilterButton>
                  <FilterButton
                    active={sortByFilter === "price-low"}
                    onClick={() => setSortByFilter("price-low")}
                  >
                    <DollarSign className="h-4 w-4 mr-1 inline" /> Price: Low to
                    High
                  </FilterButton>
                  <FilterButton
                    active={sortByFilter === "price-high"}
                    onClick={() => setSortByFilter("price-high")}
                  >
                    <DollarSign className="h-4 w-4 mr-1 inline" /> Price: High
                    to Low
                  </FilterButton>
                  <FilterButton
                    active={sortByFilter === "date-latest"}
                    onClick={() => setSortByFilter("date-latest")}
                  >
                    <Calendar className="h-4 w-4 mr-1 inline" /> Date: Latest
                  </FilterButton>
                  <FilterButton
                    active={sortByFilter === "date-oldest"}
                    onClick={() => setSortByFilter("date-oldest")}
                  >
                    <Clock className="h-4 w-4 mr-1 inline" /> Date: Oldest
                  </FilterButton>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 text-[#ff6b00] animate-spin" />
              <span className="ml-2 text-lg text-gray-600">
                Loading vehicles...
              </span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start">
              <AlertCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-medium text-red-800">
                  Error loading vehicles
                </h3>
                <p className="mt-1 text-red-700">{error}</p>
                <button
                  onClick={fetchVehicles}
                  className="mt-3 text-sm font-medium text-red-800 hover:text-red-900"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No vehicles found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || postedByFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Add your first rental vehicle to get started"}
              </p>
              <button
                onClick={handleAddNew}
                className="inline-flex items-center px-4 py-2 bg-[#ff6b00] text-white rounded-lg hover:bg-[#ff8533] transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                <span>Add Vehicle</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    {vehicle.vehicle_images && vehicle.vehicle_images[0] ? (
                      <img
                        src={
                          vehicle.vehicle_images[0].image.startsWith("http")
                            ? vehicle.vehicle_images[0].image
                            : `../../server${vehicle.vehicle_images[0].image}`
                        }
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Car className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-0 right-0 bg-[#ff6b00] text-white px-3 py-1 rounded-bl-lg font-medium">
                      Rs. {vehicle.price.day}/day
                    </div>
                    {vehicle.status === "sold" && (
                      <div className="absolute top-0 left-0 bg-red-500 text-white px-3 py-1 rounded-br-lg font-medium">
                        Sold
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <div className="flex items-center text-gray-600 mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{vehicle.year}</span>
                          <span className="mx-2">•</span>
                          <Users className="h-4 w-4 mr-1" />
                          <span className="capitalize">{vehicle.postedBy}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-gray-500">Hourly</span>
                        <span className="font-semibold text-gray-900">
                          Rs. {vehicle.price.hour}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Seats:</span>
                        <span className="ml-1">{vehicle.specs.seats}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Fuel:</span>
                        <span className="ml-1">{vehicle.specs.fuel}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Trans:</span>
                        <span className="ml-1">
                          {vehicle.specs.transmission}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Engine:</span>
                        <span className="ml-1">{vehicle.specs.engine}</span>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleView(vehicle)}
                        className="text-gray-600 hover:text-[#ff6b00] transition-colors"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle._id)}
                        className="text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && filteredVehicles.length > 0 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button className="px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 rounded-md bg-[#ff6b00] text-white">
                  1
                </button>
                <button className="px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50">
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl">
            <h2 className="text-xl font-bold mb-4">Edit Vehicle</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium">Make</label>
                <input
                  type="text"
                  value={updatedVehicleData.make}
                  onChange={(e) =>
                    setUpdatedVehicleData({
                      ...updatedVehicleData,
                      make: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Model</label>
                <input
                  type="text"
                  value={updatedVehicleData.model}
                  onChange={(e) =>
                    setUpdatedVehicleData({
                      ...updatedVehicleData,
                      model: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Year</label>
                <input
                  type="number"
                  value={updatedVehicleData.year}
                  onChange={(e) =>
                    setUpdatedVehicleData({
                      ...updatedVehicleData,
                      year: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Number Plate
                </label>
                <input
                  type="text"
                  value={updatedVehicleData.numberPlate}
                  onChange={(e) =>
                    setUpdatedVehicleData({
                      ...updatedVehicleData,
                      numberPlate: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Price (Hour)
                </label>
                <input
                  type="number"
                  value={updatedVehicleData.price.hour}
                  onChange={(e) =>
                    setUpdatedVehicleData({
                      ...updatedVehicleData,
                      price: {
                        ...updatedVehicleData.price,
                        hour: e.target.value,
                      },
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Price (Day)</label>
                <input
                  type="number"
                  value={updatedVehicleData.price.day}
                  onChange={(e) =>
                    setUpdatedVehicleData({
                      ...updatedVehicleData,
                      price: {
                        ...updatedVehicleData.price,
                        day: e.target.value,
                      },
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Price (Week)
                </label>
                <input
                  type="number"
                  value={updatedVehicleData.price.week}
                  onChange={(e) =>
                    setUpdatedVehicleData({
                      ...updatedVehicleData,
                      price: {
                        ...updatedVehicleData.price,
                        week: e.target.value,
                      },
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Price (Month)
                </label>
                <input
                  type="number"
                  value={updatedVehicleData.price.month}
                  onChange={(e) =>
                    setUpdatedVehicleData({
                      ...updatedVehicleData,
                      price: {
                        ...updatedVehicleData.price,
                        month: e.target.value,
                      },
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Seats</label>
                <input
                  type="number"
                  value={updatedVehicleData.specs.seats}
                  onChange={(e) =>
                    setUpdatedVehicleData({
                      ...updatedVehicleData,
                      specs: {
                        ...updatedVehicleData.specs,
                        seats: e.target.value,
                      },
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Doors</label>
                <input
                  type="number"
                  value={updatedVehicleData.specs.doors}
                  onChange={(e) =>
                    setUpdatedVehicleData({
                      ...updatedVehicleData,
                      specs: {
                        ...updatedVehicleData.specs,
                        doors: e.target.value,
                      },
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Transmission
                </label>
                <input
                  type="text"
                  value={updatedVehicleData.specs.transmission}
                  onChange={(e) =>
                    setUpdatedVehicleData({
                      ...updatedVehicleData,
                      specs: {
                        ...updatedVehicleData.specs,
                        transmission: e.target.value,
                      },
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Fuel Type</label>
                <input
                  type="text"
                  value={updatedVehicleData.specs.fuel}
                  onChange={(e) =>
                    setUpdatedVehicleData({
                      ...updatedVehicleData,
                      specs: {
                        ...updatedVehicleData.specs,
                        fuel: e.target.value,
                      },
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Mileage</label>
                <input
                  type="number"
                  value={updatedVehicleData.specs.mileage}
                  onChange={(e) =>
                    setUpdatedVehicleData({
                      ...updatedVehicleData,
                      specs: {
                        ...updatedVehicleData.specs,
                        mileage: e.target.value,
                      },
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Engine</label>
                <input
                  type="text"
                  value={updatedVehicleData.specs.engine}
                  onChange={(e) =>
                    setUpdatedVehicleData({
                      ...updatedVehicleData,
                      specs: {
                        ...updatedVehicleData.specs,
                        engine: e.target.value,
                      },
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Power</label>
                <input
                  type="number"
                  value={updatedVehicleData.specs.power}
                  onChange={(e) =>
                    setUpdatedVehicleData({
                      ...updatedVehicleData,
                      specs: {
                        ...updatedVehicleData.specs,
                        power: e.target.value,
                      },
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium">
                  Features (comma-separated)
                </label>
                <textarea
                  value={updatedVehicleData.features}
                  onChange={(e) =>
                    setUpdatedVehicleData({
                      ...updatedVehicleData,
                      features: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  value={updatedVehicleData.description}
                  onChange={(e) =>
                    setUpdatedVehicleData({
                      ...updatedVehicleData,
                      description: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateVehicle}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {isViewModalOpen && viewedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl">
            <h2 className="text-xl font-bold mb-4">Vehicle Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium">Images</label>
                <div className="flex gap-2 overflow-x-auto">
                  {viewedVehicle.vehicle_images.length > 0 ? (
                    viewedVehicle.vehicle_images.map((image, index) => (
                      <img
                        key={index}
                        src={
                          image.image.startsWith("http")
                            ? image.image
                            : `http://localhost:3000/uploads/${image.image}`
                        }
                        alt={`Vehicle Image ${index + 1}`}
                        className="h-32 w-32 object-cover rounded-lg border"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg";
                        }}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500">No images available</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Make</label>
                <p className="text-gray-700">{viewedVehicle.make}</p>
              </div>
              <div>
                <label className="block text-sm font-medium">Model</label>
                <p className="text-gray-700">{viewedVehicle.model}</p>
              </div>
              <div>
                <label className="block text-sm font-medium">Year</label>
                <p className="text-gray-700">{viewedVehicle.year}</p>
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Number Plate
                </label>
                <p className="text-gray-700">{viewedVehicle.numberPlate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Price (Hour)
                </label>
                <p className="text-gray-700">Rs. {viewedVehicle.price.hour}</p>
              </div>
              <div>
                <label className="block text-sm font-medium">Price (Day)</label>
                <p className="text-gray-700">Rs. {viewedVehicle.price.day}</p>
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Price (Week)
                </label>
                <p className="text-gray-700">Rs. {viewedVehicle.price.week}</p>
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Price (Month)
                </label>
                <p className="text-gray-700">Rs. {viewedVehicle.price.month}</p>
              </div>
              <div>
                <label className="block text-sm font-medium">Seats</label>
                <p className="text-gray-700">{viewedVehicle.specs.seats}</p>
              </div>
              <div>
                <label className="block text-sm font-medium">Doors</label>
                <p className="text-gray-700">{viewedVehicle.specs.doors}</p>
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Transmission
                </label>
                <p className="text-gray-700">
                  {viewedVehicle.specs.transmission}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium">Fuel Type</label>
                <p className="text-gray-700">{viewedVehicle.specs.fuel}</p>
              </div>
              <div>
                <label className="block text-sm font-medium">Mileage</label>
                <p className="text-gray-700">{viewedVehicle.specs.mileage}</p>
              </div>
              <div>
                <label className="block text-sm font-medium">Engine</label>
                <p className="text-gray-700">{viewedVehicle.specs.engine}</p>
              </div>
              <div>
                <label className="block text-sm font-medium">Power</label>
                <p className="text-gray-700">{viewedVehicle.specs.power}</p>
              </div>
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium">Features</label>
                <p className="text-gray-700">{viewedVehicle.features}</p>
              </div>
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium">Description</label>
                <p className="text-gray-700">{viewedVehicle.description}</p>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
