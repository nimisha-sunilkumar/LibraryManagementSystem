import { useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Books from './components/Books'
import Authors from './components/Authors'
import Categories from './components/Categories'
import Members from './components/Members'
import Borrow from './components/Borrow'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('dashboard')

  return (
    <div className="app">
      <Navbar />

      <div className="layout">
        <Sidebar setActivePage={setActivePage} />

        <main className="content">
{activePage === 'dashboard' && (
  <Dashboard />
)}

{activePage === 'books' && (
  <Books />
)}

{activePage === 'authors' && (
  <Authors />
)}

{activePage === 'categories' && (
  <Categories />
)}

{activePage === 'members' && (
  <Members />
)}

{activePage === 'borrow' && (
  <Borrow />
)}
        </main>
      </div>
    </div>
  )
}

export default App