"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import BuyNowForm from "../Components/BuyNowForm";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BuyVehiclesDesc() {
  const [activeSection, setActiveSection] = useState("hero");
  const [showBookNowForm, setShowBookNowForm] = useState(false);
  const [vehicle, setVehicle] = useState(null); // Store fetched vehicle data
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const mainRef = useRef(null);
  const sections = useRef({});
  const carouselRef = useRef(null);
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const vehicleId = params.get("id"); // Get the vehicle ID from URL params
  const navigate = useNavigate(); // Add navigate hook

  // Move useScroll here with layoutEffect: false
  const { scrollYProgress } = useScroll({
    target: mainRef,
    offset: ["start start", "end end"],
    layoutEffect: false,
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  const [bookingDetails, setBookingDetails] = useState({
    date: "",
    time: "",
    location: "",
    description: "",
  });

  // Update location if seller is "Shreya Auto"
  useEffect(() => {
    if (vehicle?.user?.fname === "Shreya Auto") {
      setBookingDetails((prev) => ({
        ...prev,
        location: "Shreya Auto Enterprises, Pragati Marga, Kathmandu",
      }));
    }
  }, [vehicle]);

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1, // Replace with actual user ID from auth
          vehicleId: vehicle.id,
          ...bookingDetails,
        }),
      });
      if (!response.ok) throw new Error("Failed to create appointment");
      const data = await response.json();
      console.log("Appointment created:", data);
      setShowBookNowForm(false);
      navigate("/UserAppointments");
    } catch (error) {
      console.error("Error submitting booking:", error);
    }
  };

  useEffect(() => {
    // Fetch vehicle data from the backend using the ID from the URL
    const fetchVehicle = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/vehicles/one/${vehicleId}`
        ); // Replace with your actual endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setVehicle(data.msg); // Set the vehicle data to the state
        } else {
          console.error("Vehicle not found");
        }
      } catch (error) {
        console.error("Error fetching vehicle data:", error);
      }
    };

    if (vehicleId) {
      fetchVehicle(); // Fetch vehicle data when the component mounts or vehicleId changes
    }
  }, [vehicleId]);

  useEffect(() => {
    const observers = {};
    const sectionIds = ["hero", "images", "specifications", "details"];

    sectionIds.forEach((id) => {
      observers[id] = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { threshold: 0.3 }
      );

      if (sections.current[id]) {
        observers[id].observe(sections.current[id]);
      }
    });

    return () => {
      Object.values(observers).forEach((observer) => observer.disconnect());
    };
  }, []);

  const nextImage = () => {
    if (vehicle?.images?.length) {
      setCurrentImageIndex((prev) =>
        prev === vehicle.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (vehicle?.images?.length) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? vehicle.images.length - 1 : prev - 1
      );
    }
  };

  const handleDragEnd = (e, { offset, velocity }) => {
    const swipe = offset.x;

    if (swipe < -50) {
      nextImage();
    } else if (swipe > 50) {
      prevImage();
    }
  };

  if (!vehicle) {
    return <div>Loading...</div>; // Show loading state while data is being fetched
  }

  return (
    <div ref={mainRef} className="relative">
      {/* Hero Section */}
      <motion.section
        ref={(el) => (sections.current.hero = el)}
        style={{ opacity, scale }}
        className="min-h-screen relative flex items-center py-20 px-8" // Added pl-16 for left padding
      >
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center pl-20">
          <div className="space-y-8">
            <div>
              <h1 className="text-red-600 text-2xl font-bold mb-2">
                {vehicle.model}
              </h1>
              <h2 className="text-4xl font-bold tracking-wider">
                {vehicle.make}
                <br />
              </h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-500">Year:</p>
                  <p className="text-xl">{vehicle.year}</p>
                </div>
                <div>
                  <p className="text-gray-500">Km</p>
                  <p className="text-xl">{vehicle.km}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-500">Ownership</p>
                <p className="text-xl">{vehicle.own}</p>
              </div>

              <div>
                <p className="text-gray-500">Price</p>
                <p className="text-3xl font-bold">
                  Rs. <span className="text-red-600">{vehicle.price}</span>
                </p>
              </div>

              <div>
                <p className="text-gray-500">Posted By</p>
                <p className="text-xl">{vehicle.user.fname}</p>
              </div>
              <div>
                <p className="text-gray-500">Posted Time</p>
                <p className="text-xl">
                  {new Date(vehicle.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowBookNowForm(true)} // Fixed the function call to open the booking form
              className="bg-[#4F46E5] text-white px-8 py-3 rounded-full text-lg hover:bg-[#4338CA] transition-colors"
            >
              Book Now
            </button>
          </div>

          <div className="relative">
            {vehicle.images && vehicle.images.length > 0 ? (
              <img
                src={`../../server/controllers${vehicle.images[0].image}`} // Use the first image from the vehicle images array
                alt={vehicle.title}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            ) : (
              <img
                src="/placeholder.svg"
                alt="Placeholder"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            )}
          </div>
        </div>
      </motion.section>

      {/* Navigation */}
      <div className="fixed top-1/2 -translate-y-1/2 space-y-8 z-50 left-4">
        <div className="flex flex-col items-start space-y-6">
          {["images", "specifications", "details"].map((section) => (
            <button
              key={section}
              onClick={() => {
                sections.current[section]?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className={`relative text-lg font-medium uppercase transition duration-300 ease-in-out ${
                activeSection === section
                  ? "text-red-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              {section}
              {activeSection === section && (
                <motion.div
                  layoutId="indicator"
                  className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-red-600"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Images Section with Carousel */}
      <section
        ref={(el) => (sections.current.images = el)}
        className="min-h-screen py-20 px-8 pl-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto"
        >
          <h2 className="text-3xl font-bold mb-8">Vehicle Images</h2>

          {vehicle.images && vehicle.images.length > 0 ? (
            <div
              className="relative overflow-hidden rounded-lg"
              ref={carouselRef}
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <img
                      src={`../../server/controllers${vehicle.images[currentImageIndex].image}`}
                      alt={`${vehicle.type}-image-${currentImageIndex}`}
                      className="w-3/4 h-full object-cover mx-auto" // Reduced width to 3/4 and centered
                    />
                  </motion.div>
                </AnimatePresence>

                <motion.div
                  className="absolute inset-0"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={handleDragEnd}
                />

                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Thumbnail Navigation */}
              <div className="flex justify-center mt-4 gap-2 overflow-x-auto py-2">
                {vehicle.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-16 h-16 rounded-md overflow-hidden transition-all ${
                      currentImageIndex === index
                        ? "ring-2 ring-red-600 scale-110"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={`../../server/controllers${image.image}`}
                      alt={`Thumbnail ${index}`}
                      className="w-12 h-12 object-cover" // Reduced thumbnail size
                    />
                  </button>
                ))}
              </div>

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {vehicle.images.length}
              </div>
            </div>
          ) : (
            <div className="relative aspect-video">
              <img
                src="/placeholder.svg"
                alt="Placeholder"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}
        </motion.div>
      </section>

      {/* Specifications Section */}
      <section
        ref={(el) => (sections.current.specifications = el)}
        className="min-h-[80vh] py-24 px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto grid grid-cols-3 gap-x-16 gap-y-8 pl-20"
        >
          {[
            { label: "Mileage", value: vehicle.mile },
            { label: "Seat", value: vehicle.seat },
            { label: "Fuel", value: vehicle.fuel },
            { label: "Transmission", value: vehicle.trans },
            { label: "Engine CC", value: vehicle.cc },
            { label: "Color", value: vehicle.color },
          ].map((spec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <p className="text-gray-500">{spec.label}</p>
              <p className="text-2xl font-medium">{spec.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Details Section */}
      <section
        ref={(el) => (sections.current.details = el)}
        className="min-h-[80vh] py-24 px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto grid md:grid-cols-2 gap-12 pl-20"
        >
          <div className="prose max-w-none">
            <p className="text-gray-600">{vehicle.des}</p>
          </div>
          <div>
            {vehicle.images && vehicle.images.length > 0 ? (
              <div className="relative aspect-video overflow-hidden rounded-lg mb-4">
                <img
                  src={`../../server/controllers${vehicle.images[currentImageIndex].image}`}
                  alt={`${vehicle.title}-featured`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <img
                src="/placeholder.svg"
                alt="Placeholder"
                className="w-full h-auto rounded-lg mb-4"
              />
            )}
            <button
              onClick={() => setShowBookNowForm(true)}
              className="w-full bg-[#4F46E5] text-white px-8 py-3 rounded-full text-lg hover:bg-[#4338CA] transition-colors"
            >
              Book Now
            </button>
          </div>
        </motion.div>
      </section>

      {showBookNowForm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Book Now</h2>
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
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
                  value={bookingDetails.date}
                  onChange={handleBookingChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="time"
                  className="block text-sm font-medium text-gray-700"
                >
                  Time
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={bookingDetails.time}
                  onChange={handleBookingChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700"
                >
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={bookingDetails.location}
                  onChange={handleBookingChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={bookingDetails.description}
                  onChange={handleBookingChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any additional details..."
                ></textarea>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowBookNowForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
