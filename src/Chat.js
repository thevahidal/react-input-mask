import { useEffect, useRef, useState } from "react";
import dayjs from 'dayjs'
import styled, { keyframes } from 'styled-components'

import useRecorder from "./useRecorder";

const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

const QUOTES = [
  "The quick brown fox jumps over the lazy dog.",
  "Look out! There are llamas!",
  "No, really, don't get up.",
  "Whatever",
  "I am Pouria.",
  "I am smart.",
  "I am independent.",
  "I am bringing change.",
];
const MAX_BAR_HEIGHT = 15

const beating = keyframes`
  0% {
    transform: scale( .75 );
    opacity: 0.75;
  }
  20% {
    transform: scale( 1.1 );
    opacity: 1;
  }
  40% {
    transform: scale( .75 );
    opacity: 0.75;
  }
  60% {
    transform: scale( 1.1 );
    opacity: 1;
  }
  80% {
    transform: scale( .75 );
    opacity: 0.75;
  }
  100% {
    transform: scale( .75 );
    opacity: 0.75;
  }
`;

const RecordingDot = styled.div`
  animation: ${beating} 5s infinite;
`

const SAudioBars = styled.div`
  display: flex;
  align-items: center;
  margin: 0 10px;
`

const SAudioBar = styled.div`
  width: 3px;
  height: ${p => 2 + p.height}px;
  background: #aaa;
  margin-right: 2px;
  border-radius: 2px;
`

const AudioBars = props => {

  return (
    <SAudioBars>
      {
        props.bars.slice(Math.max(props.bars.length - 50, 1)).map((b, index) => (
          <SAudioBar key={index} height={b} />
        ))
      }
    </SAudioBars>
  )
}

const Message = props => {
  const BORDER_RADIUS = 20
  let isMeStyle = {}
  let isMeWrapperStyle = {}
  if (props.isMe) {
    isMeStyle = {
      background: 'powderblue',
      borderBottomLeftRadius: BORDER_RADIUS,
      borderBottomRightRadius: 0,
      alignItems: 'flex-start',
    }
    isMeWrapperStyle = {
      alignSelf: 'flex-end',
    }
  }

  // if (!props.isSingle && !props.isMe) {
  //   isMeStyle = {
  //     ...isMeStyle,
  //     borderTopLeftRadius: 0,
  //   }
  // } else {
  //   isMeStyle = {
  //     ...isMeStyle,
  //     borderTopRightRadius: 0,
  //   }
  // }

  return (<div style={{
    marginBottom: 10,
    ...isMeWrapperStyle,
  }}>
    <div style={{
      borderRadius: BORDER_RADIUS,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: BORDER_RADIUS,
      padding: '15px 15px',
      background: '#eee',
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
let audioBarsInterval = null;
let randomMessageInterval = null;

const Chat = () => {
  const [audioURL, isRecording, startRecording, stopRecording] = useRecorder();
  const [chats, setChats] = useState([])
  const [message, setMessage] = useState('')
  const [recordingStarted, setRecordingStarted] = useState(null)
  const [recordingTimer, setRecordingTimer] = useState('00:00')
  const [audioBars, setAudioBars] = useState([])

  const bottomOfMessages = useRef()
  const fileInput = useRef()

  useEffect(() => {
    let timestamp = new Date().toISOString()
    if (audioURL) setChats([...chats, {
      type: 'AUDIO',
      data: audioURL,
      isMe: true,
      timestamp,
    }])
  }, [audioURL])

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
    if (recordingStarted) {
      audioBarsInterval = setInterval(() => {
        const audioBarHeight = Math.random() * MAX_BAR_HEIGHT
        setAudioBars(audioBars => [...audioBars, audioBarHeight])
      }, 300);
    } else if (!recordingStarted) {
      clearInterval(audioBarsInterval);
    }
    return () => clearInterval(audioBarsInterval);
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
    }, 10000);

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

  const handleFileChange = (e) => {
    const {files} = e.target
    const {length, ...rest} = files
    
    for (let key in rest) {
      setChats(chats => [...chats, {
        type: 'FILE',
        data: files[key],
        isMe: true,
        timestamp: new Date().toISOString(),
      }])
    }
  }

  const handleChange = (e) => {
    setMessage(e.target.value)
  }

  const handleRecord = () => {
    let timestamp = new Date().toISOString()
    if (isRecording) {
      stopRecording()
      setRecordingStarted(null)
      setRecordingTimer('00:00')
      setAudioBars([])
    } else {
      setRecordingStarted(timestamp)
      startRecording()
    }
  }

  const handleAddFile = () => {
    fileInput.current.click()
    // let timestamp = new Date().toISOString()
    // if (isRecording) {
    //   stopRecording()
    //   setRecordingStarted(null)
    //   setRecordingTimer('00:00')
    //   setAudioBars([])
    // } else {
    //   setRecordingStarted(timestamp)
    //   startRecording()
    // }
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
          chats.map((c, index) => {
            let isSingleMessage = true

            try {
              if (chats[index - 1].isMe === c.isMe) isSingleMessage = false
            } catch (error) { }

            return <Message key={c.timestamp} {...c} isSingle={isSingleMessage} />
          })
        }
        <div style={{ float: "left", clear: "both" }}
          ref={bottomOfMessages} />
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
          {
            !isRecording
              ? <input
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
              />
              : <div style={{
                display: 'flex'
              }}>
                <div>
                  Recording...
                  {' '}
                  {recordingTimer}
                </div>
                <AudioBars bars={audioBars} />
                <div>
                </div>
              </div>
          }
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
          <div
            onClick={handleAddFile}
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
            A
            {/* {!isRecording 
            ? 'A'
            // <img
            //   style={{
            //     height: 20,
            //   }}
            //   src={'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Font_Awesome_5_solid_microphone.svg/412px-Font_Awesome_5_solid_microphone.svg.png'}
            // /> 
            : <RecordingDot style={{
              width: 20,
              height: 20,
              background: 'red',
              borderRadius: 20,
            }} />} */}
          </div>
          <input 
            ref={fileInput} 
            multiple
            type='file' 
            onChange={handleFileChange}
            style={{
              display: 'none'
            }}
          />
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
