import React, { useState } from 'react'
import { fromJS } from 'immutable'

// TODO: enable auto compile on reload
// TODO: set up a local http server instead of using `file`

function PasswordListItem(props) {
    // Password in PasswordList
    return (
        <div className="password-list-item"
            onClick={() => {
                // Don't allow switching if user is editing a password
                if (!props.editing) {
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
                        editing={props.editing}
                        index={i}
                        setSelectedPassword={props.setSelectedPassword}
                        key={i}>
                    </PasswordListItem>
                )
            ).toJS()}
        </div>
    )
}

function PasswordDisplay(props) {
    // Display a password in detail
    return (
        <div className="password-display">
            {props.password
                ?
                <div>
                    <h2>{props.password.get('name')}</h2>
                    <p>Username: {props.password.get('username')}</p>
                    <p>Password: {props.password.get('password')}</p>

                    <button onClick={() => props.setEditing(true)}>Edit</button>
                </div>
                :
                <div></div>
            }
        </div>
    )
}

function PasswordEdit(props) {
    // Edit a password
    const [formData, setFormData] = useState(props.passwords.get(props.selectedPassword))

    const handleInputChange = e => {
        setFormData(props.passwords.get(props.selectedPassword).set(e.target.name, e.target.value))
    }

    return (
        <div className="password-edit">
            <form className="password-edit-form" onSubmit={e => {
                e.preventDefault()

                // Update password entry based on formData
                props.setPasswords(props.passwords.set(props.selectedPassword, formData))
                props.setEditing(false)
            }}>
                <label className="password-edit-form-input">
                    Name:
                    <input 
                        type="text" 
                        name="name"
                        value={formData.get('name')}
                        onChange={e => handleInputChange(e)} />
                </label>

                <label className="password-edit-form-input">
                    Username:
                    <input 
                        type="text" 
                        name="username"
                        value={formData.get('username')}
                        onChange={e => handleInputChange(e)} />
                </label>

                <label className="password-edit-form-input">
                    Password:
                    <input 
                        type="text" 
                        name="password"
                        value={formData.get('password')}
                        onChange={e => handleInputChange(e)} />
                </label>

                <input className="password-edit-form-input" type="submit" value="Submit" />
            </form>
        </div>
    )
}

export default function App(props) {
    const [editing, setEditing] = useState(false) // Is the user editing the selected password?
    const [selectedPassword, setSelectedPassword] = useState(null) // Numerical index in passwords
    const [passwords, setPasswords] = useState(fromJS([
        {
            'name': 'Google',
            'username': 'ryanhopk',
            'password': 'q*Tdf^Ou'
        },
        {
            'name': 'Amazon',
            'username': 'ryhopkins',
            'password': 'p*sdi6AQ'
        },
        {
            'name': 'Netflix',
            'username': 'ducky',
            'password': '8ziA73(!'
        }
    ]))

    return (
        <div className="app">
            <PasswordList
                editing={editing}
                passwords={passwords}
                setSelectedPassword={setSelectedPassword}>
            </PasswordList>

            {editing
                ?
                <PasswordEdit
                    setPasswords={setPasswords}
                    setEditing={setEditing}
                    selectedPassword={selectedPassword}
                    passwords={passwords}>
                </PasswordEdit>
                :
                <PasswordDisplay
                    password={Number.isInteger(selectedPassword) ? passwords.get(selectedPassword) : null}
                    setEditing={setEditing}>
                </PasswordDisplay>
            }
        </div>
    )
}