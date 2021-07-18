import React, { useEffect, useState } from "react";
// import dayjs from 'dayjs'

let timerInterval;
const Counter = props => {
  const [counter, setCounter] = useState(0)
  const [timer, setTimer] = useState('00:00')

  useEffect(() => {

    return () => clearInterval(timerInterval)
  }, [])

  const handleStart = () => {
    timerInterval = setInterval(() => {
      let seconds = 0;
      let minutes = 0;

      setCounter(counter => {
        let newCounter = counter + 1
        seconds = newCounter % 60
        minutes = Math.floor(newCounter / 60)
        return newCounter
      })

      seconds = ('0' + seconds).slice(-2)
      minutes = ('0' + minutes).slice(-2)

      setTimer(`${minutes}:${seconds}`)
    }, 100)
  }

  const handleStop = () => {
    clearInterval(timerInterval)
  }

  const handleClear = () => {
    clearInterval(timerInterval)
    setCounter(0)
    setTimer('00:00')
  }

  return (<div>
    <h1>{counter}</h1>
    <h1>{timer}</h1>
    <button
      onClick={handleStart}
    >Start</button>
    <button
      onClick={handleStop}
    >Pause</button>
    <button
      onClick={handleClear}
    >Clear</button>
  </div>)
}


export default Counter