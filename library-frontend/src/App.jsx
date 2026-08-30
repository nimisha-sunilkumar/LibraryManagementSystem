import { BrowserRouter, Routes, Route } from 'react-router-dom'

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

// ============================================================
// MEMBER COMPONENTS
// ============================================================

import MemberDashboard from './components/MemberDashboard'
import MemberBooks from './pages/member/MemberBooks'
import MemberBorrow from './pages/member/MemberBorrow'
import MyBorrows from './pages/member/MyBorrows'
import MyProfile from './components/MyProfile'

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

            <Route
              path="admin/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="admin/books"
              element={<Books />}
            />

            <Route
              path="admin/authors"
              element={<Authors />}
            />

            <Route
              path="admin/categories"
              element={<Categories />}
            />

            <Route
              path="admin/members"
              element={<Members />}
            />

            <Route
              path="admin/borrow"
              element={<Borrow />}
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
                MEMBER PROFILE
            ================================================== */}

            <Route
              path="profile"
              element={<MyProfile />}
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
          element={<MemberLayout />}
        />


        {/* ==================================================
            ADMIN WEBSITE
        ================================================== */}

        <Route
          path="/*"
          element={<AdminLayout />}
        />

      </Routes>

    </BrowserRouter>

  )
}

export default App
