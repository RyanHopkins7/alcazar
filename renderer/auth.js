import React, { useEffect, useState } from 'react'
import { fromJS } from 'immutable'

import './auth.scss'

function PinCharInput(props) {
    return (
        <input
            className="auth-pin-char-input"
            type="password"
            maxLength="1"
            autoFocus={props.index === 0}
            value={props.char}
            onChange={e => {
                props.setPin(prevPin => prevPin.set(props.index, e.target.value))
            }}>
        </input>
    )
}

export default function AuthenticationPrompt(props) {
    // TODO: set initial empty pin based on size of actual pin
    const [pin, setPin] = useState(fromJS(['', '', '', '']))

    useEffect(async () => {
        if (pin.every(char => char !== '')) {
            const authResult = await passwordVault.authenticate(pin.join(''))

            if (authResult.sessionID) {
                // Authentication succeded
                props.setSessionID(authResult.sessionID)
            } else {
                // Authentication failed
                setPin(prevPin => prevPin.map(_ => ''))
            }
        }
    }, [pin])

    return (
        <div className="auth-prompt">
            <form className="auth-form" onSubmit={e => e.preventDefault()}>
                <label className="form-input">
                    <label htmlFor="authPinInput">Enter PIN</label>
                    <div name="pin">
                        {pin.map((char, i) =>
                            <PinCharInput
                                key={i}
                                index={i}
                                char={char}
                                setPin={setPin}>
                            </PinCharInput>).toJS()
                        }
                    </div>
                    <p className="error" id="authPinError"></p>
                </label>
            </form>
        </div>
    )
}