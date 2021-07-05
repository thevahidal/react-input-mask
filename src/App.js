import { useState } from "react";

import './App.css';

const Input = props => {
  const maskChar = props.maskChar || '&'

  const unmaskValue = (value) => {
    if (!value || !props.mask) return value

    let unmaskedValue = ''
    for (let index in props.mask) {
      let valueChar = value[index]
      let maskChar = props.mask[index]
      if (!valueChar) break
      if (valueChar !== maskChar) unmaskedValue += valueChar
    }
    return unmaskedValue
  }

  const maskValue = (value) => {
    if (!value || !props.mask) return value
    const unmaskedValue = unmaskValue(value)

    let maskedValue = props.mask
    for (let index in unmaskedValue) {
      maskedValue = maskedValue.replace(maskChar, unmaskedValue[index])
    }
    const charIndex = maskedValue.lastIndexOf(unmaskedValue[unmaskedValue.length - 1])
    maskedValue = maskedValue.slice(0, charIndex + 1)
    return maskedValue
  }

  return (
    <input
      {...props}
      // type='number'
      value={maskValue(props.value)}
      onChange={e => props.onChange(unmaskValue(e.target.value))}
    />
  )
}

const App = () => {
  const [value, setValue] = useState('')
  const [mask, setMask] = useState('+$ ($$$) $$$-$$$$')
  const [maskChar, setMaskChar] = useState('$')

  return (
    <div className="App">
      <div style={{ width: '50%' }}>
        <div className='config'
          style={{
            marginBottom: 60,
          }}
        >
          <div style={{
            width: '20%', position: 'relative',
          }}
          >
            <h3 className='label'>Mask Character</h3>
            <input
              value={maskChar}
              maxLength={1}
              placeholder='&'
              onChange={e => setMaskChar(e.target.value)}
            />
          </div>
          <div style={{ width: '70%', position: 'relative' }}>
            <h3 className='label'>Mask Template</h3>
            <input
              value={mask}
              onChange={e => setMask(e.target.value)}
            />
          </div>
        </div>
        <h3 className='label'>Masked Input</h3>
        <Input
          value={value}
          onChange={text => setValue(text)}
          mask={mask}
          maskChar={maskChar}
          placeholder={mask}
          style={{ marginBottom: 30 }}
        />
        <h3 className='label'>Output</h3>
        <input
          value={value}
          disabled
          style={{
            color: '#222',
            background: '#aaa'
          }}
        />
      </div>
    </div>
  );
}

export default App;
