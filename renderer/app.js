import React, { useState, useEffect } from 'react'
import { List, fromJS } from 'immutable'

import AuthenticationPrompt from './auth'

// TODO: enable auto compile on reload
// TODO: set up a local http server instead of using `file`

function PasswordListItem(props) {
    // Password in PasswordList
    return (
        <div className="password-list-item"
            onClick={() => {
                props.setSelectedPasswordID(props.id)
            }}>{props.name}</div>
    )
}

function PasswordList(props) {
    // Vertical scrolling list of all passwords

    return (
        <div className="password-list">
            {props.passwords && props.passwords.map(
                (pw, i) => (
                    <PasswordListItem
                        name={pw.get('name')}
                        id={pw.get('_id')}
                        setSelectedPasswordID={props.setSelectedPasswordID}
                        key={i}>
                    </PasswordListItem>
                )
            ).toJS()}
        </div>
    )
}

export default function App(props) {
    const [authenticated, setAuthenticated] = useState(false)
    const [selectedPasswordID, setSelectedPasswordID] = useState(null) // ID of password in NeDB
    const [passwords, setPasswords] = useState(List())
    const [sessionID, setSessionID] = useState(null)
    const [sessionExpiration, setSessionExpiration] = useState(null)

    useEffect(async () => {
        // Retrieve passwords from NeDB
        setPasswords(fromJS(await passwordVault.listAll()))
    }, [])

    useEffect(async () => {
        // Determine if user is authenticated
        setAuthenticated(await passwordVault.authenticateSession(sessionID))
    }, [sessionID])

    useEffect(async () => {
        // When session expires, unauthenticate
        let remainingSessionTime = sessionExpiration - Date.now()

        setTimeout(() => {
            setSessionID(null)
        }, remainingSessionTime < 0 ? 0 : remainingSessionTime)
    }, [sessionExpiration])

    return (
        <div className="app">
            <PasswordList
                passwords={passwords}
                authenticated={authenticated}
                setSelectedPasswordID={setSelectedPasswordID}>
            </PasswordList>

            {/* Authentication prompt pops over entire screen */}
            {!authenticated &&
                <AuthenticationPrompt
                    setSessionID={setSessionID}
                    setSessionExpiration={setSessionExpiration}>
                </AuthenticationPrompt>
            }
        </div>
    )
}