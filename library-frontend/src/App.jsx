import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// ============================================================
// COMMON COMPONENTS
// ============================================================

import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import MemberSidebar from './components/MemberSidebar'

// ============================================================
// ADMIN COMPONENTS
// ============================================================

import Dashboard from './components/Dashboard'
import Books from './components/Books'
import Authors from './components/Authors'
import Categories from './components/Categories'
import Members from './components/Members'
import Borrow from './components/Borrow'
import Messages from './components/Messages'

// ============================================================
// MEMBER COMPONENTS
// ============================================================

import MemberDashboard from './components/MemberDashboard'
import MemberBooks from './pages/member/MemberBooks'
import MemberBorrow from './pages/member/MemberBorrow'
import MyBorrows from './pages/member/MyBorrows'
import MyProfile from './components/MyProfile'
import MyMessages from './pages/member/MyMessages'

// ============================================================
// PUBLIC PAGES
// ============================================================

import Home from './pages/public/Home'
import PublicBooks from './pages/public/Books'
import BookDetails from './pages/public/BookDetails'
import PublicCategories from './pages/public/Categories'
import About from './pages/public/About'
import Contact from './pages/public/Contact'

// ============================================================
// AUTH
// ============================================================

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

import './App.css'


// ============================================================
// PROTECTED ROUTE
// ============================================================

function ProtectedRoute({ children, role }) {

  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('role')

  // ------------------------------------------------------------
  // No login information
  // ------------------------------------------------------------

  if (!token) {

    return <Navigate to="/login" replace />

  }


  // ------------------------------------------------------------
  // Check role
  // ------------------------------------------------------------

  if (
    !userRole ||
    userRole.toLowerCase() !== role.toLowerCase()
  ) {

    // If logged-in user is Admin
    if (
      userRole?.toLowerCase() === 'admin'
    ) {

      return (
        <Navigate
          to="/admin/dashboard"
          replace
        />
      )

    }


    // If logged-in user is normal User
    if (
      userRole?.toLowerCase() === 'user'
    ) {

      return (
        <Navigate
          to="/member/dashboard"
          replace
        />
      )

    }


    // Unknown / invalid role
    return (
      <Navigate
        to="/login"
        replace
      />
    )

  }


  // ------------------------------------------------------------
  // Correct role
  // ------------------------------------------------------------

  return children

}


// ============================================================
// ADMIN LAYOUT
// ============================================================

function AdminLayout() {

  return (

    <div className="app">

      <Navbar />

      <div className="layout">

        <Sidebar />

        <main className="content">

          <Routes>

            {/* ==================================================
                ADMIN DASHBOARD
            ================================================== */}

            <Route
              path="dashboard"
              element={<Dashboard />}
            />


            {/* ==================================================
                BOOKS
            ================================================== */}

            <Route
              path="books"
              element={<Books />}
            />


            {/* ==================================================
                AUTHORS
            ================================================== */}

            <Route
              path="authors"
              element={<Authors />}
            />


            {/* ==================================================
                CATEGORIES
            ================================================== */}

            <Route
              path="categories"
              element={<Categories />}
            />


            {/* ==================================================
                MEMBERS
            ================================================== */}

            <Route
              path="members"
              element={<Members />}
            />


            {/* ==================================================
                BORROW & RETURN
            ================================================== */}

            <Route
              path="borrow"
              element={<Borrow />}
            />


            {/* ==================================================
                MESSAGES
            ================================================== */}

            <Route
              path="messages"
              element={<Messages />}
            />


            {/* ==================================================
                DEFAULT ADMIN PAGE
            ================================================== */}

            <Route
              path="*"
              element={
                <Navigate
                  to="dashboard"
                  replace
                />
              }
            />

          </Routes>

        </main>

      </div>

    </div>

  )

}


// ============================================================
// MEMBER LAYOUT
// ============================================================

function MemberLayout() {

  return (

    <div className="app">

      <Navbar />

      <div className="layout">

        <MemberSidebar />

        <main className="content">

          <Routes>

            {/* ==================================================
                MEMBER DASHBOARD
            ================================================== */}

            <Route
              path="dashboard"
              element={<MemberDashboard />}
            />


            {/* ==================================================
                MEMBER BOOKS
            ================================================== */}

            <Route
              path="books"
              element={<MemberBooks />}
            />


            {/* ==================================================
                BORROW BOOK
            ================================================== */}

            <Route
              path="borrow/:bookId"
              element={<MemberBorrow />}
            />


            {/* ==================================================
                MY BORROWED BOOKS
            ================================================== */}

            <Route
              path="borrowed"
              element={<MyBorrows />}
            />


            {/* ==================================================
                MY MESSAGES
            ================================================== */}

            <Route
              path="messages"
              element={<MyMessages />}
            />


            {/* ==================================================
                MEMBER PROFILE
            ================================================== */}

            <Route
              path="profile"
              element={<MyProfile />}
            />


            {/* ==================================================
                DEFAULT MEMBER PAGE
            ================================================== */}

            <Route
              path="*"
              element={
                <Navigate
                  to="dashboard"
                  replace
                />
              }
            />

          </Routes>

        </main>

      </div>

    </div>

  )

}


// ============================================================
// MAIN APPLICATION
// ============================================================

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* ==================================================
            PUBLIC WEBSITE
        ================================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/books"
          element={<PublicBooks />}
        />

        <Route
          path="/books/:id"
          element={<BookDetails />}
        />

        <Route
          path="/categories"
          element={<PublicCategories />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />


        {/* ==================================================
            AUTHENTICATION
        ================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ==================================================
            MEMBER WEBSITE
        ================================================== */}

        <Route
          path="/member/*"
          element={
            <ProtectedRoute role="User">
              <MemberLayout />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            ADMIN WEBSITE
        ================================================== */}

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="Admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            UNKNOWN URL
        ================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>

  )

}

export default App