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

function PasswordDisplayItem(props) {
    // Password being displayed in PasswordDisplay
    return (
        <div className="password-display-item"></div>
    )
}

function PasswordDisplay(props) {
    // Component dedicated to displaying passwords
    return (
        <div className="password-display"></div>
    )
}

export default function App(props) {
    const [selectedPassword, setSelectedPassword] = useState()
    const [passwords, setPasswords] = useState(fromJS([
        { 'name': 'Google' },
        { 'name': 'Facebook' },
        { 'name': 'Netflix' },
        { 'name': 'Apple' },
        { 'name': 'Amazon' }
    ]))

    console.log(selectedPassword)

    return (
        <div className="app">
            <PasswordList
                passwords={passwords}
                setSelectedPassword={setSelectedPassword}>
            </PasswordList>
            <PasswordDisplay></PasswordDisplay>
        </div>
    )
}