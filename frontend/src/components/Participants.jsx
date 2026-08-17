import "../styles/participants.css";

function Participants({ participants, isHost }) {

  const currentUser =
    JSON.parse(localStorage.getItem("user"));

  const totalParticipants =
    participants.length + 1;

  const getInitials = (name) => {

    if (!name) return "??";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  };

  return (

    <div className="participants-panel">

      {/* =====================================
          FIXED PARTICIPANTS HEADER
      ====================================== */}

      <div className="participants-header">

        <h2>👥 Participants</h2>

        <span>{totalParticipants}</span>

      </div>


      {/* =====================================
          ONLY THIS AREA WILL SCROLL
      ====================================== */}

      <div className="participants-list">

        {/* You */}

        <div
          className={`participant-card ${
            isHost ? "host" : ""
          }`}
        >

        <div className="participant-avatar">

          {getInitials(currentUser?.name)}

        </div>

        <div className="participant-info">

        {isHost && (
          <span className="host-badge">
              👑 Host
          </span>
        )}

        <h3>
          <span className="participant-name">
           {currentUser?.name}
          </span>
        </h3>

        <p>
          <span className="online-dot"></span>
          Online
        </p>

        </div>

        </div>


        {/* =====================================
            OTHER PARTICIPANTS
        ====================================== */}

        {participants.map((participant, index) => (

          <div
            key={participant.peerId || index}
            className={`participant-card ${
              participant.isHost ? "host" : ""
            }`}
          >

            <div className="participant-avatar">

              {getInitials(
                participant.name || `P${index + 1}`
              )}

            </div>

            <div className="participant-info">

          {participant.isHost && (
            <span className="host-badge">
              👑 Host
            </span>
          )}

          <h3>
            <span className="participant-name">
              {participant.name || `Participant ${index + 1}`}
            </span>
          </h3>

          <p>
          <span className="online-dot"></span>
           Online
          </p>

        </div>

        </div>

      ))}


        {/* =====================================
            WAITING MESSAGE
        ====================================== */}

        {participants.length === 0 && (

          <div className="waiting-box">

            <h3>
              🚀 Waiting for others...
            </h3>

            <p>
              Share your Room ID with friends to join this meeting.
            </p>

          </div>

        )}

      </div>

    </div>

  );

}

export default Participants;