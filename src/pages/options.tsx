import browser from 'webextension-polyfill'
import React, { useState, useCallback, useEffect } from 'react'
import { render } from 'react-dom'

import { Permission } from '../types.js'

import {
  getMethodString,
  readPermissions,
  removePermissions
} from '../access.js'

const store = browser.storage.local

function Options() {
  const [ key, setKey ] = useState('')
  const [ permissions, setPermissions ] = useState<Permission[]>([])
  const [ hideKey, setHideKey ] = useState(true)
  const [ message, setMessage ] = useState('')

  const showMessage = useCallback(msg => {
    setMessage(msg)
    setTimeout(setMessage, 3000)
  }, [])

  useEffect(() => {
    store.get('private_key').then(res => {
      if (typeof res.key === 'string') {
        setKey(res.key)
      }
    })
  }, [])

  useEffect(() => {
    // Load existing penmissions.
    loadPermissions()
  }, [])

  async function loadPermissions() : Promise<void> {
    const perms = await readPermissions()
    setPermissions(formatPerms(perms))
  }

  function formatPerms(perms : Record<string, Permission>) {
    return Object.entries(perms).map(p => {
      const [ host, { level, condition, created_at } ] = p
      return { host, level, condition, created_at }
    })
  }

  return (
    <>
      <h1>ord2x</h1>
      <p>Ordinal Signer Extention</p>
      <h2>Options</h2> 
      <div style={{marginBottom: '10px'}}>
        <label>
          <div>Private key:&nbsp;</div>
          <div style={{marginLeft: '10px'}}>
            <div style={{display: 'flex'}}>
              <input
                type     = { hideKey ? 'password' : 'text' }
                style    = {{ width: '600px' }}
                value    = { key }
                onChange = { handleKeyChange } 
                onFocus  = { () => setHideKey(false) }
                onBlur   = { () => setHideKey(true) }
              />
              { key === '' && <button onClick={generate}>generate</button> }
            </div>
            <button disabled={!isKeyValid()} onClick={saveKey}>
              save
            </button>
          </div>
        </label>
        {permissions?.length > 0 && (
          <>
            <h2>permissions</h2>
            <table>
              <thead>
                <tr>
                  <th>domain</th>
                  <th>permissions</th>
                  <th>condition</th>
                  <th>since</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {permissions.map(({ host, level, condition, created_at }) => (
                  <tr key={host}>
                    <td>{host}</td>
                    <td>{getMethodString(level)}</td>
                    <td>{condition}</td>
                    <td>
                      {new Date(created_at * 1000)
                        .toISOString()
                        .split('.')[0]
                        .split('T')
                        .join(' ')}
                    </td>
                    <td>
                      <button onClick={handleRevoke} data-domain={host}>
                        revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </>
  )
  
  async function handleKeyChange(e) {
    let key = e.target.value.toLowerCase().trim()
    setKey(key)
  }

  async function generate(e) {
    setKey('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
  }

  async function saveKey() {
    if (!isKeyValid()) return

    await store.set({
      private_key: key
    })

    if (key !== '') {
      setKey(key)
    }

    showMessage('saved private key!')
  }

  function isKeyValid() {
    if (key === '') return true
    if (key.match(/^[a-f0-9]{64}$/)) return true
    return false
  }

  async function handleRevoke(e) {
    let host = e.target.dataset.domain
    if (window.confirm(`revoke all permissions from ${host}?`)) {
      await removePermissions(host)
      showMessage(`removed permissions from ${host}`)
      loadPermissions()
    }
  }
}

render(<Options />, document.getElementById('main'))
