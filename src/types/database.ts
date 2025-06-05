export type Profile = {
  id: string
  full_name: string
  business_name?: string
  user_type: 'customer' | 'retailer' | 'service_provider'
  phone?: string
  address?: string
  location?: [number, number]
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name: string
  type: 'product' | 'service'
  created_at: string
}

export type Product = {
  id: string
  seller_id: string
  category_id: string
  name: string
  description?: string
  price: number
  images: string[]
  inventory_count: number
  colors: string[]
  sizes: string[]
  location?: [number, number]
  status: 'active' | 'inactive' | 'deleted'
  created_at: string
  updated_at: string
}

export type Service = {
  id: string
  provider_id: string
  category_id: string
  name: string
  description?: string
  price: number
  duration: number
  images: string[]
  location?: [number, number]
  status: 'active' | 'inactive' | 'deleted'
  created_at: string
  updated_at: string
}

export type Booking = {
  id: string
  service_id: string
  customer_id: string
  provider_id: string
  date: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  special_requests?: string
  created_at: string
  updated_at: string
}

export type Review = {
  id: string
  reviewer_id: string
  product_id?: string
  service_id?: string
  rating: number
  comment?: string
  images: string[]
  created_at: string
  updated_at: string
}