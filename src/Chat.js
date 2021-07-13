import { useEffect, useState } from "react";
import dayjs from 'dayjs'
import styled, { keyframes } from 'styled-components'

import useRecorder from "./useRecorder";

const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

var QUOTES = [
  "The quick brown fox jumps over the lazy dog.",
  "Look out! There are llamas!",
  "No, really, don't get up.",
  "Whatever",
  "I am Pouria.",
  "I am smart.",
  "I am independent.",
  "I am bringing change.",
];

const beating = keyframes`
  0% {
    transform: scale( .75 );
  }
  20% {
    transform: scale( 1.1 );
  }
  40% {
    transform: scale( .75 );
  }
  60% {
    transform: scale( 1.1 );
  }
  80% {
    transform: scale( .75 );
  }
  100% {
    transform: scale( .75 );
  }
`;

const RecordingDot = styled.div`
  animation: ${beating} 5s infinite;
`

const Message = props => {
  const BORDER_RADIUS = 20
  let isMeStyle = {}
  let isMeWrapperStyle = {}
  if (props.isMe) isMeStyle = {
    background: 'powderblue',
    borderBottomLeftRadius: BORDER_RADIUS,
    borderBottomRightRadius: 0,
    alignItems: 'flex-start',
  }
  if (props.isMe) isMeWrapperStyle = {
    alignSelf: 'flex-end',
  }

  return (<div style={{
    marginBottom: 10,
    ...isMeWrapperStyle,
  }}>
    <div style={{
      borderRadius: BORDER_RADIUS,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: BORDER_RADIUS,
      padding: '15px 15px',
      background: '#ccc',
      display: 'flex',
      alignItems: 'flex-end',
      flexDirection: 'column',
      minWidth: 100,
      ...isMeStyle,
    }}>
      {props.type === 'AUDIO'
        ? <audio src={props.data} controls />
        : props.message}
      <div style={{
        marginTop: 7,
        fontSize: 13
      }}>
        {dayjs(props.timestamp).format('HH:mm')}
      </div>
    </div>
  </div>
  )
}

let timerInterval = null;
let randomMessageInterval = null;

const Chat = () => {
  const [audioURL, isRecording, startRecording, stopRecording] = useRecorder();
  const [chats, setChats] = useState([])
  const [message, setMessage] = useState('')
  const [recordingStarted, setRecordingStarted] = useState(null)
  const [recordingTimer, setRecordingTimer] = useState('00:00')

  useEffect(() => {
    if (recordingStarted) {
      timerInterval = setInterval(() => {
        let diffInSeconds = dayjs(new Date()).diff(recordingStarted, 'seconds')
        let diffInMinutes = Math.floor(diffInSeconds / 60)
        let cleanedMinutes = ('0' + diffInMinutes).slice(-2)
        let remainingDiffInSeconds = diffInSeconds % 60
        let cleanedSeconds = ('0' + remainingDiffInSeconds).slice(-2)
        setRecordingTimer(`${cleanedMinutes}:${cleanedSeconds}`)
      }, 1000);
    } else if (!recordingStarted) {
      clearInterval(timerInterval);
    }
    return () => clearInterval(timerInterval);
  }, [recordingStarted, recordingTimer]);

  useEffect(() => {
    randomMessageInterval = setInterval(() => {
      const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)]
      setChats(chats => [...chats, {
        type: 'TEXT',
        message: quote,
        isMe: false,
        timestamp: new Date().toISOString(),
      }])
    }, 3000);

    return () => clearInterval(randomMessageInterval);
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!message) return
    setChats([...chats, {
      type: 'TEXT',
      message,
      isMe: true,
      timestamp: new Date().toISOString(),
    }])
    setMessage('')
  }

  const handleChange = (e) => {
    setMessage(e.target.value)
  }

  const handleRecord = () => {
    let timestamp = new Date().toISOString()
    if (isRecording) {
      stopRecording()
      setTimeout(() => {
        setChats([...chats, {
          type: 'AUDIO',
          data: audioURL,
          isMe: true,
          timestamp,
        }])
      }, 500)
      setRecordingStarted(null)
      setRecordingTimer('00:00')
    } else {
      setRecordingStarted(timestamp)
      startRecording()
    }
  }

  return (
    <div style={{
      position: 'relative'
    }}>
      <div style={{
        height: 'calc(100vh - 130px)',
        padding: '30px 35px',
        overflowY: 'scroll',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        background: 'url(https://i.pinimg.com/originals/92/42/05/924205ea89862667d9de018b820019fd.jpg)',
        backgroundSize: 'cover',
      }}>
        {
          chats.map(c =>
            <Message key={c.timestamp} {...c} />
          )
        }
      </div>
      <div style={{
        width: '100vw',
        position: 'fixed',
        bottom: 0,
        background: '#ccc',
        display: 'flex',
        alignItems: 'stretch',
      }}>
        <form
          onSubmit={handleSendMessage}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 35px',
          }}
        >
          {!isRecording ? <input
            autoFocus={true}
            value={message}
            onChange={handleChange}
            placeholder='Type...'
            style={{
              background: '#fff',
              border: 'none',
              borderRadius: 20,
              height: 30,
              position: 'relative',
              padding: '10px 30px',
              fontSize: 20,
              flex: 1,
            }}
          /> : <div>
            Recording...
            {' '}
            {recordingTimer}
          </div>}
          <div
            onClick={handleRecord}
            style={{
              background: 'none',
              width: 50,
              height: 50,
              borderRadius: 50,
              background: '#aaa',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 10,
            }}
          >
            {!isRecording ? <img
              style={{
                height: 20,
              }}
              src={'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Font_Awesome_5_solid_microphone.svg/412px-Font_Awesome_5_solid_microphone.svg.png'}
            /> : <RecordingDot style={{
              width: 20,
              height: 20,
              background: 'red',
              borderRadius: 20,
            }} />}
          </div>
          <input type='submit' style={{
            display: 'none'
          }}
          />
        </form>
      </div>
    </div>
  );
}

export default Chat;
