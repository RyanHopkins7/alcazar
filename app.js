import React, { useState } from 'react'
import { fromJS } from 'immutable'

// TODO: enable auto compile on reload
// TODO: set up a local http server instead of using `file`

function PasswordListItem(props) {
    // Password in PasswordList
    return (
        <div className="password-list-item"
            onClick={() => { props.setSelectedPassword(props.index) }}>{props.name}</div>
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
    // Component dedicated to displaying passwords
    return (
        <div className="password-display">
            {props.selectedPassword 
                ?
                <h2>{props.selectedPassword.get('name')}</h2>
                :
                <div></div>
            }
        </div>
    )
}

export default function App(props) {
    const [selectedPassword, setSelectedPassword] = useState(null) // Numerical index in passwords
    const [passwords, setPasswords] = useState(fromJS([
        { 
            'name': 'Google',
            'username': 'ryanhopk',
            'password': 'q*Tdf^Ou'
        },
        { 'name': 'Facebook' },
        { 'name': 'Netflix' },
        { 'name': 'Apple' },
        { 'name': 'Amazon' }
    ]))

    return (
        <div className="app">
            <PasswordList
                passwords={passwords}
                setSelectedPassword={setSelectedPassword}>
            </PasswordList>
            <PasswordDisplay
                selectedPassword={Number.isInteger(selectedPassword) ? passwords.get(selectedPassword) : null}>
            </PasswordDisplay>
        </div>
    )
}