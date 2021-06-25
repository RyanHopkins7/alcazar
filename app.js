import React, { useState, useEffect } from 'react'
import { List, fromJS } from 'immutable'

// TODO: enable auto compile on reload
// TODO: set up a local http server instead of using `file`
// IDEA: password details displayed by slide out animation which shows that vault is unlocked/locked

function PasswordListItem(props) {
    // Password in PasswordList
    return (
        <div className="password-list-item"
            onClick={() => {
                // Don't allow switching if user is creating or editing a password
                if (props.action === 'view') {
                    props.setSelectedPassword(props.index)
                }
            }}>{props.name}</div>
    )
}

function PasswordList(props) {
    // Vertical scrolling list of all passwords

    return (
        <div className="password-list">
            {props.passwords.map(
                (password, i) => (
                    <PasswordListItem
                        name={password.get('name')}
                        action={props.action}
                        index={i}
                        setSelectedPassword={props.setSelectedPassword}
                        key={i}>
                    </PasswordListItem>
                )
            ).toJS()}

            <button onClick={() => props.setAction('create')}>Create</button>
        </div>
    )
}

function PasswordDisplay(props) {
    // Display a password in detail
    const displayedPassword = Number.isInteger(props.selectedPassword) ? props.passwords.get(props.selectedPassword) : null

    return (
        <div className="password-display">
            {displayedPassword
                ?
                <div>
                    <h2>{displayedPassword.get('name')}</h2>
                    <p>Username: {displayedPassword.get('username')}</p>
                    <p>Password: {displayedPassword.get('password')}</p>

                    <button onClick={() => props.setAction('edit')}>Edit</button>
                    {/* TODO: figure out why deleting a password doesn't collapse elements below it */}
                    <button onClick={() => props.setPasswords(props.passwords.delete(props.selectedPassword))}>Delete</button>
                </div>
                :
                <div></div>
            }
        </div>
    )
}

function PasswordCreate(props) {
    const [formData, setFormData] = useState(fromJS({ 'name': '', 'username': '', 'password': '' }))

    const handleInputChange = e => {
        setFormData(prevFromData => prevFromData.set(e.target.name, e.target.value))
    }

    return (
        <div className="password-create">
            <form className="password-create-form" onSubmit={e => {
                e.preventDefault()

                // Create new password from FormData
                passwordValt.create(formData.toJS())

                props.setPasswords(props.passwords.push(formData))
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
    const [formData, setFormData] = useState(props.passwords.get(props.selectedPassword))

    const handleInputChange = e => {
        setFormData(prevFromData => prevFromData.set(e.target.name, e.target.value))
    }

    return (
        <div className="password-edit">
            <form className="password-edit-form" onSubmit={e => {
                e.preventDefault()

                // Update password entry based on formData
                props.setPasswords(props.passwords.set(props.selectedPassword, formData))
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
        </div>
    )
}

// Example passwords data
// {
//     'name': 'Google',
//     'username': 'ryanhopk',
//     'password': 'q*Tdf^Ou'
// }

export default function App(props) {
    const [action, setAction] = useState('view') // What action is the user currently taking?
    const [selectedPassword, setSelectedPassword] = useState(null) // Numerical index in passwords
    const [passwords, setPasswords] = useState(List())

    useEffect(() => {
        // Retrieve passwords from NeDB
        // TODO: prevent sensitive data from being exposed without authentication
        (async () => {
            setPasswords(fromJS(await passwordValt.listAll()))
        })();
    }, [])

    return (
        <div className="app">
            <div className="left-section">
                {/* Left section used for displaying passwords */}

                <PasswordList
                    action={action}
                    passwords={passwords}
                    setAction={setAction}
                    setSelectedPassword={setSelectedPassword}>
                </PasswordList>
            </div>

            <div className="right-section">
                {/* Right section used for user actions */}

                {action === 'view' &&
                    <PasswordDisplay
                        setPasswords={setPasswords}
                        setAction={setAction}
                        passwords={passwords}
                        selectedPassword={selectedPassword}>
                    </PasswordDisplay>
                }

                {action === 'create' &&
                    <PasswordCreate
                        setPasswords={setPasswords}
                        setAction={setAction}
                        passwords={passwords}
                        selectedPassword={selectedPassword}>
                    </PasswordCreate>
                }

                {action === 'edit' &&
                    <PasswordEdit
                        setPasswords={setPasswords}
                        setAction={setAction}
                        passwords={passwords}
                        selectedPassword={selectedPassword}>
                    </PasswordEdit>
                }
            </div>

        </div>
    )
}