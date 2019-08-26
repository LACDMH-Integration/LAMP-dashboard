
// Core Imports
import React, { useState, useEffect } from 'react'
import { HashRouter, Route, Redirect, Switch } from 'react-router-dom'
import CssBaseline from '@material-ui/core/CssBaseline'
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'
import {blue, red} from '@material-ui/core/colors'
import Fab from '@material-ui/core/Fab'
import Snackbar from '@material-ui/core/Snackbar'
import Icon from '@material-ui/core/Icon'
import 'typeface-roboto'
import { SnackbarProvider } from 'notistack'

// External Imports
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

// Local Imports
import LAMP from '../lamp'
import AppHome from './Home'
import Login from './Login'
import Root from './Root'
import Researcher from './Researcher'
import Participant from './Participant'
import NavigationLayout from '../components/NavigationLayout'

export default function App({ ...props }) {
    const [ state, setState ] = useState({})
    const [ documentTitle, setDocumentTitle ] = useState('LAMP')

    useEffect(() => {
        document.title = 'LAMP'
    }, [documentTitle])

    useEffect(() => {
        (async () => {
            LAMP.connect()

            await LAMP.Auth.refresh_identity()
            setState({ ...state, identity: LAMP.Auth.get_identity(), auth: LAMP.Auth._auth })
        })()
    }, [])

    let reset = async (identity, address) => {
        await LAMP.Auth.set_identity(identity)
        if (!!identity)
             setState({ ...state, identity: LAMP.Auth.get_identity(), auth: LAMP.Auth._auth })
        else setState({ ...state, identity: undefined, auth: undefined })
        if (!!address)
            LAMP.connect(address)
    }

    return (
        <MuiThemeProvider theme={createMuiTheme({
                typography: {
                useNextVariants: true,
            },
                palette: {
                    primary: blue,
                    secondary: red,
                    background: {
                      default: "#fff"
                    }
                },
                appBar: {
                    height: 48,
                }, 
                ripple: {
                    color: red,
                }
            })}
        >
            <CssBaseline />
            <SnackbarProvider maxSnack={3}>
                <HashRouter>
                    <Switch>

                        {/* Route index => login or home (which redirects based on user type). */}
                        <Route exact path="/" render={() =>
                            !state.identity ?
                            <Redirect to="/login" /> :
                            <Redirect to="/home" />
                        } />
                        <Route exact path="/home" render={() =>
                            (state.auth || {type: null}).type === 'root' ?
                            <Redirect to="/researcher" /> :
                            (state.auth || {type: null}).type === 'researcher' ?
                            <Redirect to="/researcher/me" /> :
                            <Redirect to="/participant/me" />
                        } />

                        {/* Route login, register, and logout. */}
                        <Route exact path="/login" render={props =>
                            !state.identity ?
                            <NavigationLayout noToolbar>
                                <Fab color="primary" aria-label="Back" variant="extended" style={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => props.history.replace('/api')}>
                                    <Icon>memory</Icon>
                                    API
                                </Fab>
                                <Login setIdentity={async (identity, address) => await reset(identity, address) } />
                            </NavigationLayout> :
                            <Redirect to="/home" />
                        } />
                        <Route exact path="/logout" render={() => {
                            reset()
                            return (<Redirect to="/" />)
                        }} />

                        {/* Route authenticated routes. */}
                        <Route exact path="/researcher" render={props =>
                            !state.identity || ((state.auth || {type: null}).type !== 'root') ?
                            <Redirect to="/login" /> :
                            <NavigationLayout profile={(state.auth || {type: null}).type === 'root' ? {} : state.identity}>
                                <Root {...props} root={state.identity} />
                                <Snackbar
                                    open
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                    message="Proceed with caution: you are logged in as the administrator."
                                />
                            </NavigationLayout>
                        } />
                        <Route exact path="/researcher/:id" render={props =>
                            !state.identity ?
                            <Redirect to="/login" /> :
                            <NavigationLayout profile={(state.auth || {type: null}).type === 'root' ? {} : state.identity}>
                                <Researcher {...props} auth={{ ...state }} />
                            </NavigationLayout>
                        } />

                        <Route exact path="/participant/:id" render={props =>
                            !state.identity ? 
                            <Redirect to="/login" /> :
                            <NavigationLayout profile={(state.auth || {type: null}).type === 'root' ? {} : state.identity}>
                                <Participant {...props} auth={{ ...state }} />
                            </NavigationLayout>
                        } />
                        
                        {/* Route to the app home screen.*/}
                        <Route exact path="/app" render={props =>
                            !state.identity ? 
                            <Redirect to="/login" /> :
                            <AppHome {...props} 
                                auth={{ ...state }} 
                                setIdentity={async (identity, address) => await reset(identity, address) } 
                            />
                        } />

                        {/* Route API documentation ONLY. */}
                        <Route exact path="/api" render={props =>
                            <div>
                                <Fab color="primary" aria-label="Back" variant="extended" style={{ position: 'fixed', top: 24, left: 24 }} onClick={() => props.history.replace('/')}>
                                    <Icon>arrow_back</Icon>
                                    Back
                                </Fab>
                                <div style={{height: 56}}></div>
                                <SwaggerUI url="https://api.lamp.digital/" docExpansion="list" />
                            </div>
                        } />
                    </Switch>
                </HashRouter>
            </SnackbarProvider>
        </MuiThemeProvider>
    )
}
