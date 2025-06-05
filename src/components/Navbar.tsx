import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="bg-primary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-accent text-xl font-bold">CommunityMarket</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-white hover:text-accent">
                  Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="text-white hover:text-accent"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-accent">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-accent text-primary px-4 py-2 rounded-md hover:bg-opacity-90"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}