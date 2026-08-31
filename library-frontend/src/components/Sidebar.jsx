import { NavLink } from 'react-router-dom'

function Sidebar() {

  const role = localStorage.getItem('role')

  const isAdmin = role === 'Admin'


  return (

    <aside className="sidebar">

      {/* ======================================================
          SIDEBAR HEADER
      ====================================================== */}

      <div className="sidebar-header">

        <div className="sidebar-icon">
          {isAdmin ? '⚙️' : '📖'}
        </div>

        <div>

          <h2>
            {isAdmin ? 'Administration' : 'Library'}
          </h2>

          <p>
            {isAdmin
              ? 'Manage your library'
              : 'Explore your library'}
          </p>

        </div>

      </div>


      {/* ======================================================
          SECTION TITLE
      ====================================================== */}

      <div className="sidebar-section-title">
        {isAdmin ? 'ADMIN MENU' : 'MEMBER MENU'}
      </div>


      {/* ======================================================
          MENU
      ====================================================== */}

      <ul className="sidebar-menu">

        {isAdmin && (
          <>

            {/* DASHBOARD */}

            <li>
              <NavLink to="/admin/dashboard">

                <span className="menu-icon">
                  📊
                </span>

                Dashboard

              </NavLink>
            </li>


            {/* BOOKS */}

            <li>
              <NavLink to="/admin/books">

                <span className="menu-icon">
                  📚
                </span>

                Books

              </NavLink>
            </li>


            {/* AUTHORS */}

            <li>
              <NavLink to="/admin/authors">

                <span className="menu-icon">
                  ✍️
                </span>

                Authors

              </NavLink>
            </li>


            {/* CATEGORIES */}

            <li>
              <NavLink to="/admin/categories">

                <span className="menu-icon">
                  🏷️
                </span>

                Categories

              </NavLink>
            </li>


            {/* MEMBERS */}

            <li>
              <NavLink to="/admin/members">

                <span className="menu-icon">
                  👥
                </span>

                Members

              </NavLink>
            </li>


            {/* BORROW & RETURN */}

            <li>
              <NavLink to="/admin/borrow">

                <span className="menu-icon">
                  🔄
                </span>

                Borrow & Return

              </NavLink>
            </li>


            {/* ==================================================
                MESSAGES
            ================================================== */}

            <li>
              <NavLink to="/admin/messages">

                <span className="menu-icon">
                  💬
                </span>

                Messages

              </NavLink>
            </li>

          </>
        )}


        {!isAdmin && (
          <>

            {/* MEMBER DASHBOARD */}

            <li>
              <NavLink to="/member/dashboard">

                <span className="menu-icon">
                  📊
                </span>

                Dashboard

              </NavLink>
            </li>


            {/* MEMBER BOOKS */}

            <li>
              <NavLink to="/member/books">

                <span className="menu-icon">
                  📚
                </span>

                Books

              </NavLink>
            </li>


            {/* MY BORROWED BOOKS */}

            <li>
              <NavLink to="/member/borrowed">

                <span className="menu-icon">
                  📋
                </span>

                My Borrowed Books

              </NavLink>
            </li>


            {/* MY PROFILE */}

            <li>
              <NavLink to="/member/profile">

                <span className="menu-icon">
                  👤
                </span>

                My Profile

              </NavLink>
            </li>

          </>
        )}

      </ul>


      {/* ======================================================
          SIDEBAR FOOTER
      ====================================================== */}

      <div className="sidebar-footer">

        <div className="sidebar-footer-icon">
          📚
        </div>

        <div>

          <strong>
            Library System
          </strong>

          <span>
            v1.0
          </span>

        </div>

      </div>

    </aside>

  )

}

export default Sidebar