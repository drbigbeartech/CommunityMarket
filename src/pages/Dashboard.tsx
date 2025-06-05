import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import type { Profile, Product, Service, Booking } from '../types/database'

export default function Dashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadDashboardData = async () => {
      try {
        // Load profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)

          // Load products/services based on user type
          if (profileData.user_type === 'retailer') {
            const { data: productsData } = await supabase
              .from('products')
              .select('*')
              .eq('seller_id', user.id)
            setProducts(productsData || [])
          } else if (profileData.user_type === 'service_provider') {
            const { data: servicesData } = await supabase
              .from('services')
              .select('*')
              .eq('provider_id', user.id)
            setServices(servicesData || [])

            // Load bookings for service provider
            const { data: bookingsData } = await supabase
              .from('bookings')
              .select('*')
              .eq('provider_id', user.id)
            setBookings(bookingsData || [])
          }
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Profile not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`${
                  activeTab === 'overview'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Overview
              </button>
              {profile.user_type === 'retailer' && (
                <button
                  onClick={() => setActiveTab('products')}
                  className={`${
                    activeTab === 'products'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Products
                </button>
              )}
              {profile.user_type === 'service_provider' && (
                <>
                  <button
                    onClick={() => setActiveTab('services')}
                    className={`${
                      activeTab === 'services'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Services
                  </button>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className={`${
                      activeTab === 'bookings'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Bookings
                  </button>
                </>
              )}
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p className="mt-1 text-sm text-gray-900">{profile.full_name}</p>
                  </div>
                  {profile.business_name && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Business Name</h3>
                      <p className="mt-1 text-sm text-gray-900">{profile.business_name}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Account Type</h3>
                    <p className="mt-1 text-sm text-gray-900">{profile.user_type}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && profile.user_type === 'retailer' && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Your Products</h2>
                  <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">
                    Add New Product
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium">{product.name}</h3>
                      <p className="text-gray-500 mt-1">{product.description}</p>
                      <p className="text-primary font-medium mt-2">${product.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'services' && profile.user_type === 'service_provider' && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Your Services</h2>
                  <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">
                    Add New Service
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => (
                    <div key={service.id} className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium">{service.name}</h3>
                      <p className="text-gray-500 mt-1">{service.description}</p>
                      <p className="text-primary font-medium mt-2">${service.price}</p>
                      <p className="text-sm text-gray-500">Duration: {service.duration} minutes</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'bookings' && profile.user_type === 'service_provider' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Your Bookings</h2>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Booking #{booking.id.slice(-6)}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.start_time} - {booking.end_time}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}