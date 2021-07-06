import React, { useState, useEffect } from 'react'
import { List, fromJS } from 'immutable'

// TODO: enable auto compile on reload
// TODO: set up a local http server instead of using `file`
// IDEA: password details displayed by slide out animation which shows that vault is unlocked/locked

function AuthenticationPrompt(props) {
    // TODO: should pop over entire screen like a prompt
    const [pin, setPin] = useState('')

    return (
        <form className="authentication-form" onSubmit={async e => {
            e.preventDefault()
            
            const authResult = await passwordVault.authenticate(pin)
            props.setSessionID(authResult.sessionID)
        }}>
            <label className="form-input">
                PIN:
                <input
                    type="password"
                    name="pin"
                    value={pin}
                    onChange={e => setPin(e.target.value)} />
            </label>

            <input type="submit" value="Submit" />
        </form>
    )
}

function PasswordListItem(props) {
    // Password in PasswordList
    return (
        <div className="password-list-item"
            onClick={() => {
                // Don't allow switching if user is creating or editing a password
                if (props.action === 'view') {
                    props.setSelectedPasswordID(props.id)
                }
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
                        action={props.action}
                        setSelectedPasswordID={props.setSelectedPasswordID}
                        key={i}>
                    </PasswordListItem>
                )
            ).toJS()}

            <button onClick={() => props.authenticated && props.setAction('create')}>Create</button>
        </div>
    )
}

function PasswordDisplay(props) {
    // Display a password in detail
    const [displayedPassword, setDisplayedPassword] = useState(null)

    useEffect(async () => {
        // Retrieve selected password from NeDB
        const selectedPassword = await passwordVault.view(props.selectedPasswordID, props.sessionID)
        setDisplayedPassword(selectedPassword && fromJS(selectedPassword))
    }, [props.selectedPasswordID, props.sessionID])

    return (
        <div className="password-display">
            {displayedPassword
                ?
                <div>
                    <h2>{displayedPassword.get('name')}</h2>
                    <p>Username: {displayedPassword.get('username')}</p>
                    <p>Password: {displayedPassword.get('password')}</p>

                    <button onClick={() => props.setAction('edit')}>Edit</button>
                    <button onClick={async () => {
                        // Delete a password
                        if (await passwordVault.delete(props.selectedPasswordID, props.sessionID)) {
                            props.setPasswords(
                                props.passwords.filter(pw => pw.get('_id') !== props.selectedPasswordID)
                            )
                            // TODO: display success message
                        } else {
                            // TODO: display an error message
                        }
                    }}>Delete</button>
                </div>
                :
                <div></div>
            }
        </div>
    )
}

function PasswordCreate(props) {
    const [formData, setFormData] = useState(fromJS({
        'name': '',
        'username': '',
        'password': ''
    }))

    const handleInputChange = e => {
        setFormData(prevFromData => prevFromData.set(e.target.name, e.target.value))
    }

    return (
        <div className="password-create">
            <form className="password-create-form" onSubmit={async e => {
                e.preventDefault()

                // Create new password from FormData
                const newPassword = fromJS(await passwordVault.create(formData.toJS(), props.sessionID))

                props.setPasswords(props.passwords.push(newPassword))

                // Display newly created password
                props.setSelectedPasswordID(newPassword.get('_id'))
                props.setAction('view')
            }}>
                <label className="form-input">
                    Name:
                    <input
                        type="text"
                        name="name"
                        value={formData.get('name')}
                        onChange={e => handleInputChange(e)} />
                </label>

                <label className="form-input">
                    Username:
                    <input
                        type="text"
                        name="username"
                        value={formData.get('username')}
                        onChange={e => handleInputChange(e)} />
                </label>

                <label className="form-input">
                    Password:
                    <input
                        type="text"
                        name="password"
                        value={formData.get('password')}
                        onChange={e => handleInputChange(e)} />
                </label>

                <input type="submit" value="Submit" />
                <button onClick={() => { props.setAction('view') }}>Cancel</button>

            </form>
        </div>
    )
}

function PasswordEdit(props) {
    // Edit a password
    const [formData, setFormData] = useState(null)

    useEffect(async () => {
        // Retrieve selected password from NeDB
        const selectedPassword = await passwordVault.view(props.selectedPasswordID, props.sessionID)
        setFormData(selectedPassword && fromJS(selectedPassword))
    }, [props.selectedPasswordID])

    const handleInputChange = e => {
        setFormData(prevFromData => prevFromData.set(e.target.name, e.target.value))
    }

    return (
        <div className="password-edit">
            {formData &&
                <form className="password-edit-form" onSubmit={async e => {
                    e.preventDefault()

                    // Update password entry based on formData
                    if (await passwordVault.update(props.selectedPasswordID, formData.toJS(), props.sessionID)) {
                        props.setPasswords(
                            props.passwords
                                .filter(pw => pw.get('_id') !== props.selectedPasswordID)
                                .push(fromJS({
                                    '_id': props.selectedPasswordID,
                                    'name': formData.get('name')
                                }))
                        )

                        // TODO: display success message
                    } else {
                        // TODO: display error message
                    }
                    props.setAction('view')
                }}>
                    <label className="form-input">
                        Name:
                        <input
                            type="text"
                            name="name"
                            value={formData.get('name')}
                            onChange={e => handleInputChange(e)} />
                    </label>

                    <label className="form-input">
                        Username:
                        <input
                            type="text"
                            name="username"
                            value={formData.get('username')}
                            onChange={e => handleInputChange(e)} />
                    </label>

                    <label className="form-input">
                        Password:
                        <input
                            type="text"
                            name="password"
                            value={formData.get('password')}
                            onChange={e => handleInputChange(e)} />
                    </label>

                    <input type="submit" value="Submit" />
                    <button onClick={() => props.setAction('view')}>Cancel</button>
                </form>
            }
        </div>
    )
}

// Example passwords data
// {
//     'name': 'Google',
//     '_id': ''
// }

export default function App(props) {
    const [authenticated, setAuthenticated] = useState(false)
    const [action, setAction] = useState('view') // What action is the user currently taking?
    const [selectedPasswordID, setSelectedPasswordID] = useState(null) // ID of password in NeDB
    const [passwords, setPasswords] = useState(List())
    const [sessionID, setSessionID] = useState(null)

    useEffect(async () => {
        // Retrieve passwords from NeDB
        setPasswords(fromJS(await passwordVault.listAll()))
    }, [])

    useEffect(async () => {
        // Determine if user is authenticated
        setAuthenticated(await passwordVault.authenticateSession(sessionID))
    }, [sessionID])

    return (
        <div className="app">
            <div className="left-section">
                {/* Left section used for listing passwords */}

                <PasswordList
                    action={action}
                    passwords={passwords}
                    authenticated={authenticated}
                    setAction={setAction}
                    setSelectedPasswordID={setSelectedPasswordID}>
                </PasswordList>
            </div>

            <div className="right-section">
                {/* Right section used for user actions */}

                {!authenticated &&
                    <AuthenticationPrompt
                        setSessionID={setSessionID}>
                    </AuthenticationPrompt>
                }

                {action === 'view' &&
                    <PasswordDisplay
                        passwords={passwords}
                        selectedPasswordID={selectedPasswordID}
                        sessionID={sessionID}
                        setPasswords={setPasswords}
                        setAction={setAction}>
                    </PasswordDisplay>
                }

                {action === 'create' &&
                    <PasswordCreate
                        passwords={passwords}
                        sessionID={sessionID}
                        setPasswords={setPasswords}
                        setAction={setAction}
                        setSelectedPasswordID={setSelectedPasswordID}>
                    </PasswordCreate>
                }

                {action === 'edit' &&
                    <PasswordEdit
                        passwords={passwords}
                        selectedPasswordID={selectedPasswordID}
                        sessionID={sessionID}
                        setPasswords={setPasswords}
                        setAction={setAction}>
                    </PasswordEdit>
                }
            </div>

        </div>
    )
}