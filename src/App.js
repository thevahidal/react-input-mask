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
  const [mask, setMask] = useState('(+$$$) $$$-$$$$-$$$$')

  return (
    <div className="App">
      <div>
        <h3 className='label'>Mask Template</h3>
        <input
          value={mask}
          onChange={e => setMask(e.target.value)}
          style={{marginBottom: 50}}
        />
        <h3 className='label'>Masked Input</h3>
        <Input 
          value={value}
          onChange={text => setValue(text)}
          mask={mask}
          maskChar='$'
          placeholder={mask}
          style={{marginBottom: 50}}
        />
        <h3 className='label'>Output</h3>
        <input 
          value={value}
          disabled
        />
      </div>
    </div>
  );
}

export default App;
