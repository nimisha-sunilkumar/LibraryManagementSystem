import { NavLink } from 'react-router-dom'

function MemberSidebar() {

  return (

    <aside className="sidebar">

      {/* ======================================================
          SIDEBAR HEADER
      ====================================================== */}

      <div className="sidebar-header">

        <div className="sidebar-icon">
          📖
        </div>

        <div>

          <h2>
            Library
          </h2>

          <p>
            Member Portal
          </p>

        </div>

      </div>


      {/* ======================================================
          SECTION TITLE
      ====================================================== */}

      <div className="sidebar-section-title">
        MEMBER MENU
      </div>


      {/* ======================================================
          MENU
      ====================================================== */}

      <ul className="sidebar-menu">

        <li>

          <NavLink to="/member/dashboard">

            <span className="menu-icon">
              📊
            </span>

            Dashboard

          </NavLink>

        </li>


        <li>

          <NavLink to="/member/books">

            <span className="menu-icon">
              📚
            </span>

            Books

          </NavLink>

        </li>


        <li>

          <NavLink to="/member/borrowed">

            <span className="menu-icon">
              📋
            </span>

            My Borrowed Books

          </NavLink>

        </li>
{/* MY MESSAGES */}

<li>
  <NavLink to="/member/messages">

    <span className="menu-icon">
      💬
    </span>

    Messages

  </NavLink>
</li>

        <li>

          <NavLink to="/member/profile">

            <span className="menu-icon">
              👤
            </span>

            My Profile

          </NavLink>

        </li>

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
            Member Portal
          </span>

        </div>

      </div>

    </aside>

  )

}

export default MemberSidebar