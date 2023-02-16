import { render }  from 'react-dom'
import React, { useState, useEffect } from 'react'
import browser from 'webextension-polyfill'

const store = browser.storage.local

function Popup() {
  const [ key, setKey ] = useState()

  useEffect(() => {
    store.get('private_key').then(privkey => {
      if (typeof privkey === 'string') {
        setKey(privkey)
      } else {
        setKey(undefined)
      }
    })

   
  }, [])

  return (
    <>
      <h2>ord2x</h2>
      {key === undefined ? (
        <p style={{width: '150px'}}>
          You don't have a private key set. Use the options page to set one.
        </p>
      ) : (
        <>
          <p>
            Your master public key:
          </p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              width: '100px'
            }}
          >
            <code>{key}</code>
          </pre>
        </>
      )}
    </>
  )

  // function toggleKeyType(e) {
  //   e.preventDefault()
  //   let nextKeyType =
  //     keys.current[(keys.current.indexOf(key) + 1) % keys.current.length]
  //   setKey(nextKeyType)
  // }
}

render(<Popup />, document.getElementById('main'))
