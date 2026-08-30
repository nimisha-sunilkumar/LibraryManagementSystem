function MyProfile() {

  const email = localStorage.getItem('email')
  const memberId = localStorage.getItem('memberId')
  const userId = localStorage.getItem('userId')

  return (

    <div>

      <h1>My Profile</h1>

      <div className="profile-card">

        <h2>Library Account</h2>

        <p>
          <strong>Email:</strong> {email}
        </p>

        <p>
          <strong>User ID:</strong> {userId}
        </p>

        <p>
          <strong>Member ID:</strong> {memberId}
        </p>

      </div>

    </div>

  )
}

export default MyProfile