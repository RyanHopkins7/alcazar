import React, { useEffect, useState, forwardRef, createRef } from 'react'
import { List } from 'immutable'

import './auth.scss'

const PinCharInput = forwardRef((props, ref) => {
    useEffect(() => {
        if (props.index === props.focusedIndex) {
            ref.current.focus()
        }
    }, [props.focusedIndex])

    return (
        <input
            className="auth-pin-char-input"
            type="password"
            maxLength="1"
            ref={ref}
            value={props.char}
            onFocus={e => {
                e.target.select()
                props.setFocusedIndex(props.index)
            }}
            onChange={e => {
                props.setPin(prevPin => prevPin.set(props.index, e.target.value))
                // TODO: make focused index rotation dynamic based on PIN size
                props.setFocusedIndex(prevIndex => prevIndex < 3 ? prevIndex + 1 : 0)
            }}>
        </input>
    )
})

export default function AuthenticationPrompt(props) {
    // TODO: set dynamically based on size of actual pin
    const [pin, setPin] = useState(List(['0', '0', '0', '0']))
    const [focusedIndex, setFocusedIndex] = useState(0)

    useEffect(async () => {
        if (pin.every(char => char !== '')) {
            const authResult = await vault.authenticate(pin.join(''))

            if (authResult.sessionID) {
                // Authentication succeded
                props.setSessionID(authResult.sessionID)
                props.setSessionExpiration(authResult.expiration)
            } else {
                // Authentication failed; clear PIN
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
                                focusedIndex={focusedIndex}
                                setFocusedIndex={setFocusedIndex}
                                ref={createRef()}
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