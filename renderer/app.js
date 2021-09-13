import React, { useState, useEffect } from 'react'
import { List, fromJS } from 'immutable'

import AuthenticationPrompt from './auth'

// TODO: enable auto compile on reload
// TODO: set up a local http server instead of using `file`

function CredentialGridItem(props) {
    // Credential in CredentialGrid
    return (
        <div className="credential-grid-item"
            onClick={() => {
                props.setSelectedPasswordID(props.id)
            }}>{props.name}</div>
    )
}

function CredentialGrid(props) {
    // Scrolling grid of all credentials

    return (
        <div className="credential-grid">
            {props.credentials && props.credentials.map(
                (cred, i) => (
                    <CredentialGridItem
                        name={cred.get('name')}
                        id={cred.get('_id')}
                        setSelectedPasswordID={props.setSelectedPasswordID}
                        key={i}>
                    </CredentialGridItem>
                )
            ).toJS()}
        </div>
    )
}

export default function App(props) {
    const [authenticated, setAuthenticated] = useState(false)
    const [selectedPasswordID, setSelectedPasswordID] = useState(null) // ID of password in NeDB
    const [credentials, setCredentials] = useState(List())
    const [sessionID, setSessionID] = useState(null)
    const [sessionExpiration, setSessionExpiration] = useState(null)

    useEffect(async () => {
        // Retrieve passwords from NeDB
        setCredentials(fromJS(await vault.listAll()))
    }, [])

    useEffect(async () => {
        // Determine if user is authenticated
        setAuthenticated(await vault.authenticateSession(sessionID))
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
            <CredentialGrid
                credentials={credentials}
                authenticated={authenticated}
                setSelectedPasswordID={setSelectedPasswordID}>
            </CredentialGrid>

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