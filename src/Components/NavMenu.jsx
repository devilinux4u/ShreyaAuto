"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Logo from "../assets/Logo.png"
import { Menu, X, ChevronDown, User } from "lucide-react"
import Cookies from "js-cookie"

const NavMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userFullName, setUserFullName] = useState("")

  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate("/Login")
  }

  const handleLogo = () => {
    navigate("/Home")
  }

  const toggleServices = () => {
    setIsServicesOpen(!isServicesOpen)
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)

    // Check login status and user info
    const checkLoginStatus = () => {
      const loggedIn = Cookies.get('sauto') ? true : false;
      setIsLoggedIn(loggedIn)
      if (loggedIn) {
        const fullName = Cookies.get('sauto').split('-')[2]
        setUserFullName(fullName || "")
      }
    }

    checkLoginStatus()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userFullName")
    setIsLoggedIn(false)
    setUserFullName("")
    navigate("/Login")
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out w-full ${
        isScrolled ? "bg-white shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="w-full px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src={Logo || "/placeholder.svg"}
                alt="Shreya Auto Logo"
                className="h-12 w-auto"
                onClick={handleLogo}
              />
            </Link>
          </div>

          {/* Navigation and User Profile */}
          <div className="hidden md:flex md:items-center">
            {/* Desktop Navigation */}
            <div className="flex items-baseline space-x-8">
              <NavLink to="/">Home</NavLink>
              <div className="relative group">
                <button
                  onClick={toggleServices}
                  className="text-gray-800 group-hover:text-blue-600 px-3 py-2 rounded-md text-lg font-medium flex items-center transition duration-300 ease-in-out"
                >
                  Services
                  <ChevronDown className="ml-1 w-5 h-5 transition-transform duration-300 ease-in-out group-hover:rotate-180" />
                </button>
                <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-300 ease-in-out">
                  <div className="py-2" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <NavLink to="/RentalVehicles" menuItem>
                      Rent
                    </NavLink>
                    <NavLink to="/BuyVehicles" menuItem>
                      Buy And Sell
                    </NavLink>
                    <NavLink to="/YourList" menuItem>
                      Wishlist
                    </NavLink>
                    <NavLink to="/LostAndFound" menuItem>
                      Lost and Found
                    </NavLink>
                  </div>
                </div>
              </div>
              <NavLink to="/AboutUs">About</NavLink>
              <NavLink to="/Contact">Contact</NavLink>
              <NavLink to="/FAQ">FAQ</NavLink>
            </div>

            {/* User Profile or Get Started Button */}
            <div className="flex items-center space-x-4 ml-8">
              {isLoggedIn ? (
                <div className="flex items-center space-x-3">
                  <div className="relative group">
                    <button
                      className="flex items-center space-x-2 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                    >
                      <User className="h-5 w-5" />
                      <span className="font-medium text-sm hidden sm:inline">{userFullName}</span>
                      <ChevronDown className="h-4 w-4 hidden sm:inline" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-300 ease-in-out">
                      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <Link
                          to="/UserProfile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                          role="menuitem"
                        >
                          Your Profile
                        </Link>
                        <Link
                          to="/Settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                          role="menuitem"
                        >
                          My Bookings
                        </Link>
                        <Link
                          to="/Settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                          role="menuitem"
                        >
                         Items Reported
                        </Link>
                        <Link
                          to="/Settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                          role="menuitem"
                        >
                         History
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                          role="menuitem"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleGetStarted}
                  className="px-6 py-3 rounded-full text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition duration-300 ease-in-out"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-8 w-8" aria-hidden="true" />
              ) : (
                <Menu className="block h-8 w-8" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
        <div className="px-4 pt-2 pb-3 space-y-1 bg-white">
          <NavLink to="/" mobile>
            Home
          </NavLink>
          <button
            onClick={toggleServices}
            className="text-gray-800 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left transition duration-300 ease-in-out"
          >
            Services
          </button>
          {isServicesOpen && (
            <div className="pl-4 space-y-1">
              <NavLink to="/RentalVehicles" mobile>
                Rent
              </NavLink>
              <NavLink to="/BuyVehicles" mobile>
                Buy And Sell
              </NavLink>
              <NavLink to="/Wishlist" mobile>
                Wishlist
              </NavLink>
              <NavLink to="/LostAndFound" mobile>
                Lost and Found
              </NavLink>
            </div>
          )}
          <NavLink to="/about" mobile>
            About
          </NavLink>
          <NavLink to="/contact" mobile>
            Contact
          </NavLink>
          <NavLink to="/faq" mobile>
            FAQ
          </NavLink>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200 bg-white">
          <div className="px-4">
            {isLoggedIn ? (
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">{userFullName}</span>
                <button
                  className="p-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                >
                  <User className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGetStarted}
                className="block w-full px-5 py-3 text-center text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition duration-300 ease-in-out transform hover:scale-105 mt-3"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

const NavLink = ({ to, children, mobile, menuItem }) => (
  <Link
    to={to}
    className={`
      ${
        mobile
          ? "block px-3 py-2 rounded-md text-base font-medium"
          : menuItem
            ? "block px-4 py-2 text-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            : "text-gray-800 hover:text-blue-600 px-3 py-2 rounded-md text-lg font-medium"
      }
      transition duration-300 ease-in-out hover:bg-blue-50
    `}
  >
    {children}
  </Link>
)

export default NavMenu

