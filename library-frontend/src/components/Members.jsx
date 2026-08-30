import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

// ---------------------------------------
// Authorization headers
// ---------------------------------------

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

function Members() {

  const [members, setMembers] = useState([])

  const [showForm, setShowForm] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState(null)

  const [newMember, setNewMember] = useState({
    fullName: '',
    admissionNumber: '',
    department: '',
    year: '',
    semester: '',
    email: '',
    phoneNumber: '',
    address: '',
    joinedDate: '',
    isActive: true
  })

  // ---------------------------------------
  // Search fields
  // ---------------------------------------

  const [search, setSearch] = useState({
    name: '',
    admissionNumber: '',
    department: '',
    year: '',
    semester: ''
  })

  // ---------------------------------------
  // GET ALL MEMBERS
  // ---------------------------------------

  const fetchMembers = async () => {

    try {

      const response = await fetch(
        `${API_URL}/api/Members`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch members')
      }

      const data = await response.json()

      setMembers(data)

    } catch (error) {

      console.error(
        'Error fetching members:',
        error
      )

      setMembers([])
    }
  }

  // ---------------------------------------
  // LOAD MEMBERS WHEN PAGE OPENS
  // ---------------------------------------

  useEffect(() => {
    fetchMembers()
  }, [])

  // ---------------------------------------
  // RESET FORM
  // ---------------------------------------

  const resetForm = () => {

    setNewMember({
      fullName: '',
      admissionNumber: '',
      department: '',
      year: '',
      semester: '',
      email: '',
      phoneNumber: '',
      address: '',
      joinedDate: '',
      isActive: true
    })

    setEditingMemberId(null)

    setShowForm(false)
  }

  // ---------------------------------------
  // ADD MEMBER
  // ---------------------------------------

  const handleAddMember = async (event) => {

    event.preventDefault()

    try {

      const response = await fetch(
        `${API_URL}/api/Members`,
        {
          method: 'POST',

          headers: getAuthHeaders(),

          body: JSON.stringify({
            ...newMember,
            year: Number(newMember.year),
            semester: Number(newMember.semester)
          })
        }
      )

      if (!response.ok) {

        const errorText =
          await response.text()

        throw new Error(
          errorText || 'Failed to add member'
        )
      }

      alert('Member added successfully!')

      resetForm()

      fetchMembers()

    } catch (error) {

      console.error(
        'Error adding member:',
        error
      )

      alert(
        `Failed to add member.\n\n${error.message}`
      )
    }
  }

  // ---------------------------------------
  // EDIT MEMBER
  // ---------------------------------------

  const handleEditMember = (member) => {

    setEditingMemberId(
      member.memberId
    )

    setNewMember({

      fullName:
        member.fullName || '',

      admissionNumber:
        member.admissionNumber || '',

      department:
        member.department || '',

      year:
        String(member.year ?? ''),

      semester:
        String(member.semester ?? ''),

      email:
        member.email || '',

      phoneNumber:
        member.phoneNumber || '',

      address:
        member.address || '',

      joinedDate:
        member.joinedDate
          ? member.joinedDate.substring(0, 10)
          : '',

      isActive:
        member.isActive
    })

    setShowForm(true)
  }

  // ---------------------------------------
  // UPDATE MEMBER
  // ---------------------------------------

  const handleUpdateMember = async (event) => {

    event.preventDefault()

    try {

      const response = await fetch(
        `${API_URL}/api/Members/${editingMemberId}`,
        {
          method: 'PUT',

          headers: getAuthHeaders(),

          body: JSON.stringify({
            ...newMember,
            year: Number(newMember.year),
            semester: Number(newMember.semester)
          })
        }
      )

      if (!response.ok) {

        const errorText =
          await response.text()

        throw new Error(
          errorText || 'Failed to update member'
        )
      }

      alert(
        'Member updated successfully!'
      )

      resetForm()

      fetchMembers()

    } catch (error) {

      console.error(
        'Error updating member:',
        error
      )

      alert(
        `Failed to update member.\n\n${error.message}`
      )
    }
  }

  // ---------------------------------------
  // DELETE MEMBER
  // ---------------------------------------

  const handleDeleteMember = async (id) => {

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this member?'
      )

    if (!confirmed) {
      return
    }

    try {

      const response = await fetch(
        `${API_URL}/api/Members/${id}`,
        {
          method: 'DELETE',

          // IMPORTANT:
          // Delete also requires Admin JWT
          headers: getAuthHeaders()
        }
      )

      if (!response.ok) {

        const errorText =
          await response.text()

        throw new Error(
          errorText || 'Failed to delete member'
        )
      }

      alert(
        'Member deleted successfully!'
      )

      fetchMembers()

    } catch (error) {

      console.error(
        'Error deleting member:',
        error
      )

      alert(
        `Failed to delete member.\n\n${error.message}`
      )
    }
  }

  // ---------------------------------------
  // SEARCH MEMBERS
  // ---------------------------------------

  const searchMembers = async () => {

    const params =
      new URLSearchParams()

    // Name

    if (search.name.trim()) {

      params.append(
        'name',
        search.name.trim()
      )
    }

    // Admission Number

    if (search.admissionNumber.trim()) {

      params.append(
        'admissionNumber',
        search.admissionNumber.trim()
      )
    }

    // Department

    if (search.department.trim()) {

      params.append(
        'department',
        search.department.trim()
      )
    }

    // Year

    if (search.year) {

      params.append(
        'year',
        search.year
      )
    }

    // Semester

    if (search.semester) {

      params.append(
        'semester',
        search.semester
      )
    }

    // ---------------------------------------
    // If no search fields are entered
    // show all members
    // ---------------------------------------

    if (params.toString() === '') {

      fetchMembers()

      return
    }

    try {

      const response = await fetch(
        `${API_URL}/api/Members/search?${params.toString()}`,
        {
          method: 'GET',

          // IMPORTANT:
          // Search also requires Admin JWT
          headers: getAuthHeaders()
        }
      )

      if (!response.ok) {

        const errorText =
          await response.text()

        throw new Error(
          errorText || 'No members found'
        )
      }

      const data =
        await response.json()

      setMembers(data)

    } catch (error) {

      console.error(
        'Error searching members:',
        error
      )

      setMembers([])
    }
  }

  // ---------------------------------------
  // CLEAR SEARCH
  // ---------------------------------------

  const clearSearch = () => {

    setSearch({
      name: '',
      admissionNumber: '',
      department: '',
      year: '',
      semester: ''
    })

    fetchMembers()
  }

  // ---------------------------------------
  // RENDER
  // ---------------------------------------

  return (

    <div>

      {/* -------------------------------- */}
      {/* PAGE TITLE */}
      {/* -------------------------------- */}

      <h1>
        Members
      </h1>


      {/* -------------------------------- */}
      {/* ADD MEMBER BUTTON */}
      {/* -------------------------------- */}

      <button
        onClick={() => {

          if (showForm) {

            resetForm()

          } else {

            setShowForm(true)

          }

        }}
      >

        {showForm
          ? 'Cancel'
          : 'Add Member'}

      </button>


      {/* -------------------------------- */}
      {/* ADD / EDIT FORM */}
      {/* -------------------------------- */}

      {showForm && (

        <form
          onSubmit={
            editingMemberId
              ? handleUpdateMember
              : handleAddMember
          }
        >

          <h2>

            {editingMemberId
              ? 'Edit Member'
              : 'Add Member'}

          </h2>


          {/* Full Name */}

          <input
            type="text"
            placeholder="Full Name"
            value={newMember.fullName}
            onChange={(event) =>
              setNewMember({
                ...newMember,
                fullName:
                  event.target.value
              })
            }
            required
          />


          {/* Admission Number */}

          <input
            type="text"
            placeholder="Admission Number"
            value={
              newMember.admissionNumber
            }
            onChange={(event) =>
              setNewMember({
                ...newMember,
                admissionNumber:
                  event.target.value
              })
            }
            required
          />


          {/* Department */}

          <input
            type="text"
            placeholder="Department"
            value={
              newMember.department
            }
            onChange={(event) =>
              setNewMember({
                ...newMember,
                department:
                  event.target.value
              })
            }
            required
          />


          {/* Year */}

          <input
            type="number"
            placeholder="Year (1-4)"
            min="1"
            max="4"
            value={newMember.year}
            onChange={(event) =>
              setNewMember({
                ...newMember,
                year:
                  event.target.value
              })
            }
            required
          />


          {/* Semester */}

          <input
            type="number"
            placeholder="Semester (1-8)"
            min="1"
            max="8"
            value={newMember.semester}
            onChange={(event) =>
              setNewMember({
                ...newMember,
                semester:
                  event.target.value
              })
            }
            required
          />


          {/* Email */}

          <input
            type="email"
            placeholder="Email"
            value={newMember.email}
            onChange={(event) =>
              setNewMember({
                ...newMember,
                email:
                  event.target.value
              })
            }
            required
          />


          {/* Phone Number */}

          <input
            type="text"
            placeholder="Phone Number"
            value={
              newMember.phoneNumber
            }
            onChange={(event) =>
              setNewMember({
                ...newMember,
                phoneNumber:
                  event.target.value
              })
            }
            required
          />


          {/* Address */}

          <input
            type="text"
            placeholder="Address"
            value={newMember.address}
            onChange={(event) =>
              setNewMember({
                ...newMember,
                address:
                  event.target.value
              })
            }
          />


          {/* Joined Date */}

          <label>
            Joined Date
          </label>

          <input
            type="date"
            value={
              newMember.joinedDate
            }
            onChange={(event) =>
              setNewMember({
                ...newMember,
                joinedDate:
                  event.target.value
              })
            }
            required
          />


          {/* Active Status */}

          <label>

            <input
              type="checkbox"
              checked={
                newMember.isActive
              }
              onChange={(event) =>
                setNewMember({
                  ...newMember,
                  isActive:
                    event.target.checked
                })
              }
            />

            Active Member

          </label>


          <br />


          {/* Submit */}

          <button type="submit">

            {editingMemberId
              ? 'Update Member'
              : 'Save Member'}

          </button>


          {/* Cancel */}

          <button
            type="button"
            onClick={resetForm}
          >
            Cancel
          </button>

        </form>
      )}


      {/* -------------------------------- */}
      {/* SEARCH MEMBERS */}
      {/* -------------------------------- */}

      <div className="search-box">

        <h2>
          Search Members
        </h2>


        {/* Name */}

        <input
          type="text"
          placeholder="Name"
          value={search.name}
          onChange={(event) =>
            setSearch({
              ...search,
              name:
                event.target.value
            })
          }
        />


        {/* Admission Number */}

        <input
          type="text"
          placeholder="Admission Number"
          value={
            search.admissionNumber
          }
          onChange={(event) =>
            setSearch({
              ...search,
              admissionNumber:
                event.target.value
            })
          }
        />


        {/* Department */}

        <input
          type="text"
          placeholder="Department"
          value={
            search.department
          }
          onChange={(event) =>
            setSearch({
              ...search,
              department:
                event.target.value
            })
          }
        />


        {/* Year */}

        <input
          type="number"
          placeholder="Year"
          min="1"
          max="4"
          value={search.year}
          onChange={(event) =>
            setSearch({
              ...search,
              year:
                event.target.value
            })
          }
        />


        {/* Semester */}

        <input
          type="number"
          placeholder="Semester"
          min="1"
          max="8"
          value={
            search.semester
          }
          onChange={(event) =>
            setSearch({
              ...search,
              semester:
                event.target.value
            })
          }
        />


        {/* Search */}

        <button
          onClick={searchMembers}
        >
          Search
        </button>


        {/* Show All */}

        <button
          onClick={clearSearch}
        >
          Show All
        </button>

      </div>


      {/* -------------------------------- */}
      {/* MEMBERS LIST */}
      {/* -------------------------------- */}

      <div className="members-list">

        {members.map(member => (

          <div
            className="member-card"
            key={member.memberId}
          >

            <h3>
              {member.fullName}
            </h3>


            <p>
              Admission Number:{' '}
              {member.admissionNumber}
            </p>


            <p>
              Department:{' '}
              {member.department}
            </p>


            <p>
              Year:{' '}
              {member.year}
            </p>


            <p>
              Semester:{' '}
              {member.semester}
            </p>


            <p>
              Email:{' '}
              {member.email}
            </p>


            <p>
              Phone:{' '}
              {member.phoneNumber}
            </p>


            <p>
              Address:{' '}
              {member.address || 'N/A'}
            </p>


            <p>

              Status:{' '}

              {member.isActive
                ? 'Active'
                : 'Inactive'}

            </p>


            {/* Edit */}

            <button
              onClick={() =>
                handleEditMember(
                  member
                )
              }
            >
              Edit
            </button>


            {/* Delete */}

            <button
              onClick={() =>
                handleDeleteMember(
                  member.memberId
                )
              }
            >
              Delete
            </button>

          </div>

        ))}

      </div>


      {/* -------------------------------- */}
      {/* EMPTY STATE */}
      {/* -------------------------------- */}

      {members.length === 0 && (

        <p>
          No members found.
        </p>

      )}

    </div>
  )
}

export default Members