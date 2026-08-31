import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

function MyMessages() {

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
  // LOAD MEMBER CONVERSATIONS
  // ============================================================

  const loadConversations = async () => {

    try {

      setLoading(true)
      setError('')

      const token = getToken()

      if (!token) {
        throw new Error(
          'Please login to view your messages.'
        )
      }


      const response = await fetch(
        `${API_URL}/api/Messages/my`,
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
            : data.message ||
              'Failed to load your messages.'
        )

      }


      setConversations(data)

    } catch (error) {

      console.error(
        'Error loading member conversations:',
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
  // OPEN CONVERSATION
  // ============================================================

  const openConversation = async (conversationId) => {

    try {

      setConversationLoading(true)
      setError('')

      const token = getToken()


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
            : data.message ||
              'Failed to load conversation.'
        )

      }


      setSelectedConversation(data)


      // --------------------------------------------------------
      // Mark admin messages as read
      // --------------------------------------------------------

      await markConversationAsRead(
        conversationId,
        false
      )


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
  // MARK ADMIN MESSAGES AS READ
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

      setSelectedConversation(previous => {

        if (
          !previous ||
          previous.conversationId !== conversationId
        ) {
          return previous
        }


        return {

          ...previous,

          messages: previous.messages.map(message => {

            // Member is reading ADMIN messages

            if (message.isFromAdmin) {

              return {
                ...message,
                isRead: true
              }

            }

            return message

          })

        }

      })


      // --------------------------------------------------------
      // Refresh conversation list
      // --------------------------------------------------------

      if (reload) {

        await loadConversations()

      }

    } catch (error) {

      console.error(
        'Error marking messages as read:',
        error
      )

    }

  }


  // ============================================================
  // SEND REPLY
  // ============================================================

  const sendReply = async () => {

    if (!reply.trim()) {

      alert('Please enter a message.')

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
  // LOADING
  // ============================================================

  if (loading) {

    return (

      <div className="messages-page">

        <h1>
          My Messages
        </h1>

        <p>
          Loading your conversations...
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
          My Messages
        </h1>

        <div className="messages-error">
          {error}
        </div>

      </div>

    )

  }


  // ============================================================
  // UNREAD COUNT
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
            LIBRARY COMMUNICATION
          </p>

          <h1>
            My Messages
          </h1>

          <p>
            View your conversations and replies
            from the library administration.
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
            My Conversations
          </span>

          <strong>
            {conversations.length}
          </strong>

        </div>


        <div className="message-summary-card">

          <span>
            Unread Replies
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
              My Conversations
            </h2>

          </div>


          {conversations.length === 0 ? (

            <div className="no-messages">

              <div className="no-messages-icon">
                💬
              </div>

              <h2>
                No conversations yet
              </h2>

              <p>
                Your messages to the library
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
                Choose a conversation to view
                your messages and library replies.
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
                          : 'You'}

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
                    placeholder="Write your reply to the library..."
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

                  🔒 This conversation has been closed
                  by the library.

                </div>

              )}

            </>

          )}

        </div>

      </div>

    </div>

  )

}

export default MyMessages