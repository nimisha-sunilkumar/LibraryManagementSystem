function Sidebar({ setActivePage }) {
  return (
    <aside className="sidebar">
      <h2>Menu</h2>

      <ul>
        <li onClick={() => setActivePage('dashboard')}>
          Dashboard
        </li>

        <li onClick={() => setActivePage('books')}>
          Books
        </li>

        <li onClick={() => setActivePage('authors')}>
          Authors
        </li>

        <li onClick={() => setActivePage('categories')}>
          Categories
        </li>

        <li onClick={() => setActivePage('members')}>
          Members
        </li>

        <li onClick={() => setActivePage('borrow')}>
          Borrow & Return
        </li>
      </ul>
    </aside>
  )
}

export default Sidebar