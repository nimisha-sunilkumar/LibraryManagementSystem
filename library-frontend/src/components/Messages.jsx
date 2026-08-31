import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

function Messages() {

  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)

  const [loading, setLoading] = useState(true)
  const [conversationLoading, setConversationLoading] = useState(false)

  const [error, setError] = useState('')
  const [reply, setReply] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)


  // ============================================================
  // GET TOKEN
  // ============================================================

  const getToken = () => {
    return localStorage.getItem('token')
  }


  // ============================================================
  // LOAD ALL CONVERSATIONS
  // ============================================================

  const loadConversations = async () => {

    try {

      setLoading(true)
      setError('')

      const token = getToken()

      if (!token) {
        throw new Error(
          'Admin authentication token not found.'
        )
      }


      const response = await fetch(
        `${API_URL}/api/Messages`,
        {
          method: 'GET',

          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )


      const responseText = await response.text()

      let data

      try {
        data = JSON.parse(responseText)
      } catch {
        data = responseText
      }


      if (!response.ok) {

        throw new Error(
          typeof data === 'string'
            ? data
            : data.message || 'Failed to load messages.'
        )

      }


      setConversations(data)

    } catch (error) {

      console.error(
        'Error loading conversations:',
        error
      )

      setError(error.message)

    } finally {

      setLoading(false)

    }

  }


  // ============================================================
  // LOAD WHEN PAGE OPENS
  // ============================================================

  useEffect(() => {

    loadConversations()

  }, [])


  // ============================================================
  // OPEN ONE CONVERSATION
  // ============================================================

 const openConversation = async (conversationId) => {

  try {

    setConversationLoading(true)
    setError('')

    const token = getToken()

    if (!token) {
      throw new Error('Admin authentication token not found.')
    }

    // ============================================================
    // LOAD CONVERSATION
    // ============================================================

    const response = await fetch(
      `${API_URL}/api/Messages/${conversationId}`,
      {
        method: 'GET',

        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const responseText = await response.text()

    let data

    try {
      data = JSON.parse(responseText)
    } catch {
      data = responseText
    }

    if (!response.ok) {

      throw new Error(
        typeof data === 'string'
          ? data
          : data.message || 'Failed to load conversation.'
      )

    }

    // ============================================================
    // MARK MEMBER MESSAGES AS READ
    // ============================================================

    await markConversationAsRead(
      conversationId,
      false
    )

    // ============================================================
    // UPDATE CONVERSATION
    // ============================================================

    const updatedConversation = {
      ...data,

      messages: data.messages.map(message => {

        if (!message.isFromAdmin) {

          return {
            ...message,
            isRead: true
          }

        }

        return message

      })
    }

    setSelectedConversation(updatedConversation)

  } catch (error) {

    console.error(
      'Error opening conversation:',
      error
    )

    setError(error.message)

  } finally {

    setConversationLoading(false)

  }

}


  // ============================================================
  // MARK CONVERSATION AS READ
  // ============================================================

  const markConversationAsRead = async (
    conversationId,
    reload = true
  ) => {

    try {

      const token = getToken()

      const response = await fetch(
        `${API_URL}/api/Messages/${conversationId}/read`,
        {
          method: 'PUT',

          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )


      const responseText = await response.text()

      let data

      try {
        data = JSON.parse(responseText)
      } catch {
        data = responseText
      }


      if (!response.ok) {

        throw new Error(
          typeof data === 'string'
            ? data
            : data.message ||
              'Failed to mark messages as read.'
        )

      }


      // --------------------------------------------------------
      // Update selected conversation
      // --------------------------------------------------------

      if (
        selectedConversation &&
        selectedConversation.conversationId === conversationId
      ) {

        setSelectedConversation(previous => {

          if (!previous) {
            return previous
          }

          return {
            ...previous,

            messages: previous.messages.map(message => {

              if (!message.isFromAdmin) {

                return {
                  ...message,
                  isRead: true
                }

              }

              return message

            })

          }

        })

      }


      // --------------------------------------------------------
      // Refresh conversation list
      // --------------------------------------------------------

      if (reload) {
        await loadConversations()
      }


    } catch (error) {

      console.error(
        'Error marking conversation as read:',
        error
      )

      alert(error.message)

    }

  }


  // ============================================================
  // REPLY TO CONVERSATION
  // ============================================================

  const sendReply = async () => {

    if (!reply.trim()) {

      alert('Please enter a reply.')

      return

    }


    if (!selectedConversation) {
      return
    }


    try {

      setReplyLoading(true)

      const token = getToken()


      const response = await fetch(
        `${API_URL}/api/Messages/${selectedConversation.conversationId}/reply`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',

            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            content: reply.trim()
          })
        }
      )


      const responseText = await response.text()

      let data

      try {
        data = JSON.parse(responseText)
      } catch {
        data = responseText
      }


      if (!response.ok) {

        throw new Error(
          typeof data === 'string'
            ? data
            : data.message ||
              'Failed to send reply.'
        )

      }


      setReply('')


      // --------------------------------------------------------
      // Reload conversation
      // --------------------------------------------------------

      await openConversation(
        selectedConversation.conversationId
      )


      // --------------------------------------------------------
      // Refresh conversation list
      // --------------------------------------------------------

      await loadConversations()


    } catch (error) {

      console.error(
        'Error sending reply:',
        error
      )

      alert(error.message)

    } finally {

      setReplyLoading(false)

    }

  }


  // ============================================================
  // CLOSE CONVERSATION
  // ============================================================

  const closeConversation = async () => {

    if (!selectedConversation) {
      return
    }


    const confirmed = window.confirm(
      'Are you sure you want to close this conversation?'
    )


    if (!confirmed) {
      return
    }


    try {

      const token = getToken()


      const response = await fetch(
        `${API_URL}/api/Messages/${selectedConversation.conversationId}/close`,
        {
          method: 'PUT',

          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )


      const responseText = await response.text()

      let data

      try {
        data = JSON.parse(responseText)
      } catch {
        data = responseText
      }


      if (!response.ok) {

        throw new Error(
          typeof data === 'string'
            ? data
            : data.message ||
              'Failed to close conversation.'
        )

      }


      await openConversation(
        selectedConversation.conversationId
      )

      await loadConversations()


    } catch (error) {

      console.error(
        'Error closing conversation:',
        error
      )

      alert(error.message)

    }

  }


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (

      <div className="messages-page">

        <h1>
          Messages
        </h1>

        <p>
          Loading conversations...
        </p>

      </div>

    )

  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error && conversations.length === 0) {

    return (

      <div className="messages-page">

        <h1>
          Messages
        </h1>

        <div className="messages-error">
          {error}
        </div>

      </div>

    )

  }


  // ============================================================
  // SUMMARY
  // ============================================================

  const unreadConversations =
    conversations.filter(
      conversation =>
        conversation.unreadCount > 0
    ).length


  // ============================================================
  // PAGE
  // ============================================================

  return (

    <div className="messages-page">


      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="messages-header">

        <div>

          <p className="messages-label">
            MEMBER COMMUNICATION
          </p>

          <h1>
            Messages
          </h1>

          <p>
            View and respond to conversations
            sent by library members.
          </p>

        </div>


        <button
          className="messages-refresh-button"
          onClick={loadConversations}
        >
          ↻ Refresh
        </button>

      </div>


      {/* ======================================================
          SUMMARY
      ======================================================= */}

      <div className="messages-summary">

        <div className="message-summary-card">

          <span>
            Total Conversations
          </span>

          <strong>
            {conversations.length}
          </strong>

        </div>


        <div className="message-summary-card">

          <span>
            Unread Conversations
          </span>

          <strong>
            {unreadConversations}
          </strong>

        </div>

      </div>


      {/* ======================================================
          MAIN CONTENT
      ======================================================= */}

      <div className="messages-layout">


        {/* ====================================================
            CONVERSATION LIST
        ===================================================== */}

        <div className="conversation-list">

          <div className="conversation-list-header">

            <h2>
              Conversations
            </h2>

          </div>


          {conversations.length === 0 ? (

            <div className="no-messages">

              <div className="no-messages-icon">
                💬
              </div>

              <h2>
                No messages yet
              </h2>

              <p>
                Messages sent by members
                will appear here.
              </p>

            </div>

          ) : (

            conversations.map(conversation => (

              <button
                key={conversation.conversationId}
                className={`conversation-item ${
                  selectedConversation?.conversationId ===
                  conversation.conversationId
                    ? 'conversation-selected'
                    : ''
                }`}
                onClick={() =>
                  openConversation(
                    conversation.conversationId
                  )
                }
              >

                <div className="conversation-item-top">

                  <strong>
                    {conversation.subject}
                  </strong>


                  {conversation.unreadCount > 0 && (

                    <span className="unread-badge">
                      {conversation.unreadCount}
                    </span>

                  )}

                </div>


                <p className="conversation-member">

                  👤 {conversation.memberName}

                </p>


                <p className="conversation-preview">

                  {conversation.lastMessage?.content ||
                    'No messages'}

                </p>


                <span className="conversation-date">

                  {new Date(
                    conversation.createdAt
                  ).toLocaleString()}

                </span>

              </button>

            ))

          )}

        </div>


        {/* ====================================================
            CONVERSATION DETAILS
        ===================================================== */}

        <div className="conversation-details">

          {!selectedConversation ? (

            <div className="conversation-empty">

              <div className="conversation-empty-icon">
                💬
              </div>

              <h2>
                Select a conversation
              </h2>

              <p>
                Choose a conversation from the
                left to view the messages.
              </p>

            </div>

          ) : conversationLoading ? (

            <div className="conversation-empty">

              <p>
                Loading conversation...
              </p>

            </div>

          ) : (

            <>

              {/* ============================================
                  CONVERSATION HEADER
              ============================================= */}

              <div className="conversation-details-header">

                <div>

                  <p className="messages-label">
                    CONVERSATION
                  </p>

                  <h2>
                    {selectedConversation.subject}
                  </h2>

                  <p>
                    👤 {selectedConversation.memberName}
                  </p>

                  <p>
                    📧 {selectedConversation.memberEmail}
                  </p>

                </div>


                <div>

                  {!selectedConversation.isClosed && (

                    <button
                      className="close-conversation-button"
                      onClick={closeConversation}
                    >
                      Close Conversation
                    </button>

                  )}

                </div>

              </div>


              {/* ============================================
                  MESSAGES
              ============================================= */}

              <div className="conversation-messages">

                {selectedConversation.messages.map(
                  message => (

                    <div
                      key={message.messageId}
                      className={`conversation-message ${
                        message.isFromAdmin
                          ? 'admin-message'
                          : 'member-message'
                      }`}
                    >

                      <div className="message-sender">

                        {message.isFromAdmin
                          ? 'Library Admin'
                          : selectedConversation.memberName}

                      </div>


                      <div className="message-bubble">

                        {message.content}

                      </div>


                      <div className="message-time">

                        {new Date(
                          message.createdAt
                        ).toLocaleString()}

                      </div>

                    </div>

                  )
                )}

              </div>


              {/* ============================================
                  REPLY
              ============================================= */}

              {!selectedConversation.isClosed ? (

                <div className="conversation-reply">

                  <textarea
                    rows="4"
                    placeholder="Write your reply to this member..."
                    value={reply}
                    onChange={event =>
                      setReply(event.target.value)
                    }
                  />


                  <button
                    className="primary-button"
                    onClick={sendReply}
                    disabled={replyLoading}
                  >

                    {replyLoading
                      ? 'Sending...'
                      : 'Send Reply →'}

                  </button>

                </div>

              ) : (

                <div className="conversation-closed">

                  🔒 This conversation has been closed.

                </div>

              )}

            </>

          )}

        </div>

      </div>

    </div>

  )

}

export default Messages