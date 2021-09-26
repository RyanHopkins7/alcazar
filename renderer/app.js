import React, { useState, useEffect } from 'react'
import { List, Map, fromJS } from 'immutable'

import AuthenticationPrompt from './auth'

// TODO: enable auto compile on reload
// TODO: set up a local http server instead of using `file`

function SecretModal(props) {
    // Overlay displays secret data
    // console.log(props.selectedSecretData && props.selectedSecretData.mapKeys(k => k.toString()).toJS())

    return (
        <div className="overlay secret-modal">
            <div className="secret-data">
                {props.selectedSecretData && props.selectedSecretData.entrySeq().map(
                    ([fieldName, data]) => (
                        <p>{fieldName}: {data}</p>
                    )
                ).toJS()}
            </div>
        </div>
    )
}

function SecretGridItem(props) {
    // Secret in SecretGrid
    return (
        <div className="secret-grid-item"
            onClick={() => {
                props.setSelectedSecretID(props.id)
            }}>

            <div className="icon"></div>
            <p>{props.name}</p>

        </div>
    )
}

function SecretGrid(props) {
    // Scrolling grid of all secrets
    return (
        <div className="secret-grid">
            {props.secrets && props.secrets.map(
                (secret, i) => (
                    <SecretGridItem
                        name={secret.get('name')}
                        id={secret.get('_id')}
                        setSelectedSecretID={props.setSelectedSecretID}
                        key={i}>
                    </SecretGridItem>
                )
            ).toJS()}
        </div>
    )
}

export default function App(props) {
    const [authenticated, setAuthenticated] = useState(false)
    const [selectedSecretID, setSelectedSecretID] = useState(null) // ID of secret in NeDB
    const [selectedSecretData, setSelectedSecretData] = useState(Map())
    const [secrets, setSecrets] = useState(List())
    const [sessionID, setSessionID] = useState(null)
    const [sessionExpiration, setSessionExpiration] = useState(null)

    useEffect(async () => {
        // Retrieve secrets from NeDB
        setSecrets(fromJS(await vault.listAll()))
    }, [])

    useEffect(async () => {
        // Retrieve data from vault when a secret is selected
        setSelectedSecretData(fromJS(await vault.read(selectedSecretID, sessionID)))
    }, [selectedSecretID])

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
            <SecretGrid
                secrets={secrets}
                authenticated={authenticated}
                setSelectedSecretID={setSelectedSecretID}>
            </SecretGrid>

            {/* When a secret is selected, overlay covers screen */}
            {selectedSecretID &&
                <SecretModal
                    selectedSecretData={selectedSecretData}>
                </SecretModal>
            }

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