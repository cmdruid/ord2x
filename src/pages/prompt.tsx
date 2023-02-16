import { render } from 'react-dom'
import React      from 'react'
import browser    from 'webextension-polyfill'
import { getAllowedMethods } from '../access.js'

function Prompt() {
  const query = new URLSearchParams(location.search)
  const id    = query.get('id')
  const host  = query.get('host')
  const level = parseInt(query.get('level') ?? '0')
  let params : Record<string, any>
  try {
    params = JSON.parse(query.get('params') ?? '')
    if (Object.keys(params).length === 0) params = {}
  } catch (err) { params = {} }

  return (
    <>
      <div>
        <b style={{display: 'block', textAlign: 'center', fontSize: '200%'}}>
          {host}
        </b>{' '}
        <p>is requesting your permission to </p>
        <ul>
          {getAllowedMethods(level).map(cap => (
            <li key={cap}>
              <i style={{fontSize: '140%'}}>{cap}</i>
            </li>
          ))}
        </ul>
      </div>
      {params && (
        <>
          <p>now acting on</p>
          <pre style={{overflow: 'auto', maxHeight: '100px'}}>
            <code>{JSON.stringify(params, null, 2)}</code>
          </pre>
        </>
      )}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-around'
        }}
      >
        <button
          style={{marginTop: '5px'}}
          onClick={authorizeHandler('forever')}
        >
          authorize forever
        </button>
        <button
          style={{marginTop: '5px'}}
          onClick={authorizeHandler('expirable')}
        >
          authorize for 5 minutes
        </button>
        <button style={{marginTop: '5px'}} onClick={authorizeHandler('single')}>
          authorize just this
        </button>
        <button style={{marginTop: '5px'}} onClick={authorizeHandler('no')}>
          cancel
        </button>
      </div>
    </>
  )

  function authorizeHandler(condition) {
    return function (e) {
      e.preventDefault()
      browser.runtime.sendMessage({
        prompt: true,
        id,
        host,
        level,
        condition
      })
    }
  }
}

render(<Prompt />, document.getElementById('main'))
