import { useEffect, useState } from 'react'
const API_URL = import.meta.env.VITE_API_URL

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

  // Search fields
  const [search, setSearch] = useState({
    name: '',
    admissionNumber: '',
    department: '',
    year: '',
    semester: ''
  })

  // -----------------------------
  // GET ALL MEMBERS
  // -----------------------------
  const fetchMembers = () => {
    fetch(`${API_URL}/api/Members`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch members')
        }

        return response.json()
      })
      .then(data => {
        setMembers(data)
      })
      .catch(error => {
        console.error('Error fetching members:', error)
      })
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  // -----------------------------
  // RESET FORM
  // -----------------------------
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

  // -----------------------------
  // ADD MEMBER
  // -----------------------------
  const handleAddMember = async (event) => {
    event.preventDefault()

    try {
      const response = await fetch(`${API_URL}/api/Members`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newMember)
})

      if (!response.ok) {
        throw new Error('Failed to add member')
      }

      alert('Member added successfully!')

      resetForm()
      fetchMembers()
    } catch (error) {
      console.error('Error adding member:', error)
    }
  }

  // -----------------------------
  // EDIT MEMBER
  // -----------------------------
  const handleEditMember = (member) => {
    setEditingMemberId(member.memberId)

    setNewMember({
      fullName: member.fullName,
      admissionNumber: member.admissionNumber,
      department: member.department,
      year: String(member.year),
      semester: String(member.semester),
      email: member.email,
      phoneNumber: member.phoneNumber,
      address: member.address || '',
      joinedDate: member.joinedDate
        ? member.joinedDate.substring(0, 10)
        : '',
      isActive: member.isActive
    })

    setShowForm(true)
  }

  // -----------------------------
  // UPDATE MEMBER
  // -----------------------------
  const handleUpdateMember = async (event) => {
    event.preventDefault()

    try {
      const response = await fetch(`${API_URL}/api/Members/${editingMemberId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newMember)
})

      if (!response.ok) {
        throw new Error('Failed to update member')
      }

      alert('Member updated successfully!')

      resetForm()
      fetchMembers()
    } catch (error) {
      console.error('Error updating member:', error)
    }
  }

  // -----------------------------
  // DELETE MEMBER
  // -----------------------------
  const handleDeleteMember = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this member?'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/Members/${id}`, {
  method: 'DELETE'
})

      if (!response.ok) {
        throw new Error('Failed to delete member')
      }

      alert('Member deleted successfully!')

      fetchMembers()
    } catch (error) {
      console.error('Error deleting member:', error)
    }
  }

  // -----------------------------
  // SEARCH MEMBERS
  // -----------------------------
  const searchMembers = async () => {
  const params = new URLSearchParams()

  if (search.name.trim()) {
    params.append('name', search.name.trim())
  }

  if (search.admissionNumber.trim()) {
    params.append(
      'admissionNumber',
      search.admissionNumber.trim()
    )
  }

  if (search.department.trim()) {
    params.append(
      'department',
      search.department.trim()
    )
  }

  if (search.year) {
    params.append('year', search.year)
  }

  if (search.semester) {
    params.append('semester', search.semester)
  }

  if (params.toString() === '') {
    fetchMembers()
    return
  }

  try {
    const response = await fetch(
      `${API_URL}/api/Members/search?${params.toString()}`
    )

    if (!response.ok) {
      throw new Error('No members found')
    }

    const data = await response.json()
    setMembers(data)

  } catch (error) {
    console.error('Error searching members:', error)
    setMembers([])
  }
}
  // -----------------------------
  // CLEAR SEARCH
  // -----------------------------
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

  return (
    <div>
      <h1>Members</h1>

      {/* ADD MEMBER BUTTON */}
      <button
        onClick={() => {
          if (showForm) {
            resetForm()
          } else {
            setShowForm(true)
          }
        }}
      >
        {showForm ? 'Cancel' : 'Add Member'}
      </button>

      {/* ADD / EDIT FORM */}
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

          <input
            type="text"
            placeholder="Full Name"
            value={newMember.fullName}
            onChange={(event) =>
              setNewMember({
                ...newMember,
                fullName: event.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="Admission Number"
            value={newMember.admissionNumber}
            onChange={(event) =>
              setNewMember({
                ...newMember,
                admissionNumber: event.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="Department"
            value={newMember.department}
            onChange={(event) =>
              setNewMember({
                ...newMember,
                department: event.target.value
              })
            }
          />

          <input
  type="number"
  placeholder="Year (1-4)"
  min="1"
  max="4"
  value={newMember.year}
  onChange={(event) =>
    setNewMember({
      ...newMember,
      year: event.target.value
    })
  }
/>

         <input
  type="number"
  placeholder="Semester (1-8)"
  min="1"
  max="8"
  value={newMember.semester}
  onChange={(event) =>
    setNewMember({
      ...newMember,
      semester: event.target.value
    })
  }
/>

          <input
            type="email"
            placeholder="Email"
            value={newMember.email}
            onChange={(event) =>
              setNewMember({
                ...newMember,
                email: event.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={newMember.phoneNumber}
            onChange={(event) =>
              setNewMember({
                ...newMember,
                phoneNumber: event.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="Address"
            value={newMember.address}
            onChange={(event) =>
              setNewMember({
                ...newMember,
                address: event.target.value
              })
            }
          />

          <label>
            Joined Date
          </label>

          <input
            type="date"
            value={newMember.joinedDate}
            onChange={(event) =>
              setNewMember({
                ...newMember,
                joinedDate: event.target.value
              })
            }
          />

          <label>
            <input
              type="checkbox"
              checked={newMember.isActive}
              onChange={(event) =>
                setNewMember({
                  ...newMember,
                  isActive: event.target.checked
                })
              }
            />

            Active Member
          </label>

          <br />

          <button type="submit">
            {editingMemberId
              ? 'Update Member'
              : 'Save Member'}
          </button>

          <button
            type="button"
            onClick={resetForm}
          >
            Cancel
          </button>
        </form>
      )}

      {/* SEARCH */}
      <div className="search-box">
        <h2>Search Members</h2>

        <input
          type="text"
          placeholder="Name"
          value={search.name}
          onChange={(event) =>
            setSearch({
              ...search,
              name: event.target.value
            })
          }
        />

        <input
          type="text"
          placeholder="Admission Number"
          value={search.admissionNumber}
          onChange={(event) =>
            setSearch({
              ...search,
              admissionNumber: event.target.value
            })
          }
        />

        <input
          type="text"
          placeholder="Department"
          value={search.department}
          onChange={(event) =>
            setSearch({
              ...search,
              department: event.target.value
            })
          }
        />

        <input
          type="number"
          placeholder="Year"
          value={search.year}
          onChange={(event) =>
            setSearch({
              ...search,
              year: event.target.value
            })
          }
        />

        <input
          type="number"
          placeholder="Semester"
          value={search.semester}
          onChange={(event) =>
            setSearch({
              ...search,
              semester: event.target.value
            })
          }
        />

        <button onClick={searchMembers}>
          Search
        </button>

        <button onClick={clearSearch}>
          Show All
        </button>
      </div>

      {/* MEMBERS LIST */}
      <div className="members-list">
        {members.map(member => (
          <div
            className="member-card"
            key={member.memberId}
          >
            <h3>{member.fullName}</h3>

            <p>
              Admission Number: {member.admissionNumber}
            </p>

            <p>
              Department: {member.department}
            </p>

            <p>
              Year: {member.year}
            </p>

            <p>
              Semester: {member.semester}
            </p>

            <p>
              Email: {member.email}
            </p>

            <p>
              Phone: {member.phoneNumber}
            </p>

            <p>
              Address: {member.address}
            </p>

            <p>
              Status:{' '}
              {member.isActive
                ? 'Active'
                : 'Inactive'}
            </p>

            <button
              onClick={() =>
                handleEditMember(member)
              }
            >
              Edit
            </button>

            <button
              onClick={() =>
                handleDeleteMember(member.memberId)
              }
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <p>No members found.</p>
      )}
    </div>
  )
}

export default Members