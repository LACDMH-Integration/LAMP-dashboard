
// Core Imports
import React, { useState, useEffect, useRef } from 'react'
import { HashRouter, Route, Redirect, Switch } from 'react-router-dom'
import CssBaseline from '@material-ui/core/CssBaseline'
import { ThemeProvider } from '@material-ui/core/styles'
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'
import {blue, red} from '@material-ui/core/colors'
import Fab from '@material-ui/core/Fab'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import Icon from '@material-ui/core/Icon'
import 'typeface-roboto'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import { SnackbarProvider } from 'notistack'

// External Imports
import DateFnsUtils from '@date-io/date-fns'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

// Local Imports
import LAMP from '../lamp'
import AppHome from './Home'
import Login from './Login'
import Root from './Root'
import Researcher from './Researcher'
import Participant from './Participant'
import NavigationLayout from './NavigationLayout'
import { PageTitle } from './Utils'

/* TODO: /researcher/:researcher_id/activity/:activity_id -> editor ui */
/* TODO: /participant/:participant_id/activity/:activity_id -> activity ui */
/* TODO: /participant/:participant_id/messaging -> messaging */

export default function App({ ...props }) {
    const [ deferredPrompt, setDeferredPrompt ] = useState(null)
    const [ state, setState ] = useState({ identity: LAMP.Auth._me, auth: LAMP.Auth._auth })
    const [ store, setStore ] = useState({ researchers: [], participants: [] })
    const storeRef = useRef([])

    useEffect(() => {
        let query = window.location.hash.split('?')
        if (!!query && query.length > 1) {
            let x = atob(Object.fromEntries(new URLSearchParams(query[1]))['a']).split(':')
            reset({ 
                type: ['root', 'admin'].includes(x[0]) ? 'root' : (x[0].includes('@') ? 'researcher' : 'participant'), 
                id: x[0] === 'admin' ? 'root' : x[0],
                password: x[1],
                serverAddress: x[2]
            }).then(x => {
                //props.history.replace('/')
            })
        } else if (!state.identity) {
            LAMP.Auth.refresh_identity().then(x => {
                setState(state => ({ ...state, identity: LAMP.Auth._me, auth: LAMP.Auth._auth }))
            })
        }
    }, [])

    if (window.matchMedia('(display-mode: standalone)').matches)
        console.log('Launched from home screen!')
    window.addEventListener('beforeinstallprompt', (e) => setDeferredPrompt(e))

    let reset = async (identity) => {
        await LAMP.Auth.set_identity(identity)
        if (!!identity)
             setState(state => ({ ...state, identity: LAMP.Auth._me, auth: LAMP.Auth._auth }))
        else setState(state => ({ ...state, identity: null, auth: null }))
    }

    let getResearcher = (id) => {
        if (id === 'me' && state.auth.type === 'researcher')
            id = state.identity.id
        if (!id || id === 'me')
            return null //props.history.replace(`/`)
        if (!!store.researchers[id]) {
            return store.researchers[id]
        } else if (!storeRef.current.includes(id)) {
            LAMP.Researcher.view(id).then(x => setStore({ 
                researchers: { ...store.researchers, [id]: x }, 
                participants: store.participants 
            }))
            storeRef.current = [ ...storeRef.current, id ]
        }
        return null
    }

    let getParticipant = (id) => {
        if (id === 'me' && state.auth.type === 'participant')
            id = state.identity.id
        if (!id || id === 'me')
            return null //props.history.replace(`/`)
        if (!!store.participants[id]) {
            return store.participants[id]
        } else if (!storeRef.current.includes(id)) {
            LAMP.Participant.view(id).then(x => setStore({ 
                researchers: store.researchers,
                participants: { ...store.participants, [id]: x }
            }))
            storeRef.current = [ ...storeRef.current, id ]
        }
        return null
    }

    const promptInstall = () => {
        if (deferredPrompt === null)
            return
        deferredPrompt.prompt()
        deferredPrompt.userChoice.then((c) => {
            if (c.outcome === 'accepted') {
                console.log('App will be installed.')
            } else {
                console.log('App not installed.')
            }
            setDeferredPrompt(null)
        })
    }

    return (
        <ThemeProvider theme={createMuiTheme({
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
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <SnackbarProvider maxSnack={3}>
                    <HashRouter>
                        <Switch>

                            {/* Route index => login or home (which redirects based on user type). */}
                            <Route exact path="/" render={props =>
                                (!(window.location.hash.split('?').length > 1 && !state.identity)) ?
                                (!state.identity ?
                                    <React.Fragment>
                                        <PageTitle>mindLAMP | Login</PageTitle>
                                        <NavigationLayout 
                                            noToolbar 
                                            goBack={props.history.goBack} 
                                            onLogout={() => reset()}
                                        >
                                            <Fab color="primary" aria-label="Back" variant="extended" style={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => props.history.replace('/api')}>
                                                <Icon>memory</Icon>
                                                <span style={{ width: 8 }} />
                                                API
                                            </Fab>
                                            <Login setIdentity={async (identity) => await reset(identity) } onComplete={() => props.history.replace('/')} />
                                        </NavigationLayout>
                                    </React.Fragment> :
                                    (state.auth.type === 'root' ?
                                        <Redirect to="/researcher" /> :
                                    state.auth.type === 'researcher' ?
                                        <Redirect to="/researcher/me" /> :
                                        <Redirect to="/participant/me" />
                                    )
                                ) : <React.Fragment />
                            } />

                            {/* Route authenticated routes. */}
                            <Route exact path="/researcher" render={props =>
                                !state.identity || (state.auth.type !== 'root') ?
                                <React.Fragment>
                                    <PageTitle>mindLAMP | Login</PageTitle>
                                    <NavigationLayout 
                                        noToolbar 
                                        goBack={props.history.goBack} 
                                        onLogout={() => reset()}
                                    >
                                        <Fab color="primary" aria-label="Back" variant="extended" style={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => props.history.replace('/api')}>
                                            <Icon>memory</Icon>
                                            <span style={{ width: 8 }} />
                                            API
                                        </Fab>
                                        <Login setIdentity={async (identity) => await reset(identity) } onComplete={() => props.history.replace('/')} />
                                    </NavigationLayout>
                                </React.Fragment> :
                                <React.Fragment>
                                    <PageTitle>Administrator</PageTitle>
                                    <NavigationLayout 
                                        title="Administrator" 
                                        profile={state.auth.type === 'root' ? {} : state.identity} 
                                        goBack={props.history.goBack} 
                                        onLogout={() => reset()}
                                    >
                                        <Root {...props} root={state.identity} />
                                        <Snackbar
                                            open
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                            message="Proceed with caution: you are logged in as the administrator."
                                        />
                                    </NavigationLayout>
                                </React.Fragment>
                            } />
                            <Route exact path="/researcher/:id" render={props =>
                                !state.identity ? 
                                <React.Fragment>
                                    <PageTitle>mindLAMP | Login</PageTitle>
                                    <NavigationLayout 
                                        noToolbar 
                                        goBack={props.history.goBack} 
                                        onLogout={() => reset()}
                                    >
                                        <Fab color="primary" aria-label="Back" variant="extended" style={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => props.history.replace('/api')}>
                                            <Icon>memory</Icon>
                                            <span style={{ width: 8 }} />
                                            API
                                        </Fab>
                                        <Login setIdentity={async (identity) => await reset(identity) } onComplete={() => props.history.replace('/')} />
                                    </NavigationLayout>
                                </React.Fragment>:
                                !getResearcher(props.match.params.id) ? 
                                <React.Fragment /> :
                                <React.Fragment>
                                    <PageTitle>{`${getResearcher(props.match.params.id).name}`}</PageTitle>
                                    <NavigationLayout 
                                        id={props.match.params.id}
                                        title={`${getResearcher(props.match.params.id).name}`} 
                                        profile={state.auth.type === 'root' ? {} : state.identity}
                                        goBack={props.history.goBack} 
                                        onLogout={() => reset()}
                                    >
                                        <Researcher researcher={getResearcher(props.match.params.id)} onParticipantSelect={(id) => props.history.push(`/participant/${id}`)} />
                                    </NavigationLayout>
                                </React.Fragment>
                            } />

                            <Route exact path="/participant/:id" render={props =>
                                !state.identity ? 
                                <React.Fragment>
                                    <PageTitle>mindLAMP | Login</PageTitle>
                                    <NavigationLayout 
                                        noToolbar 
                                        goBack={props.history.goBack} 
                                        onLogout={() => reset()}
                                    >
                                        <Fab color="primary" aria-label="Back" variant="extended" style={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => props.history.replace('/api')}>
                                            <Icon>memory</Icon>
                                            <span style={{ width: 8 }} />
                                            API
                                        </Fab>
                                        <Login setIdentity={async (identity) => await reset(identity) } onComplete={() => props.history.replace('/')} />
                                    </NavigationLayout>
                                </React.Fragment> : 
                                !getParticipant(props.match.params.id) ? 
                                <React.Fragment /> :
                                <React.Fragment>
                                    <PageTitle>{`Patient ${getParticipant(props.match.params.id).id}`}</PageTitle>
                                    <NavigationLayout 
                                        enableMessaging
                                        id={props.match.params.id}
                                        title={`Patient ${getParticipant(props.match.params.id).id}`} 
                                        profile={state.auth.type === 'root' ? {} : state.identity}
                                        goBack={props.history.goBack} 
                                        onLogout={() => reset()}
                                    >
                                        <Participant participant={getParticipant(props.match.params.id)} />
                                    </NavigationLayout>
                                </React.Fragment>
                            } />
                            
                            {/* Route to the app home screen.*/}
                            <Route exact path="/app" render={props =>
                                !state.identity ? 
                                <React.Fragment>
                                    <PageTitle>mindLAMP | Login</PageTitle>
                                    <NavigationLayout 
                                        noToolbar 
                                        goBack={props.history.goBack} 
                                        onLogout={() => reset()}
                                    >
                                        <Fab color="primary" aria-label="Back" variant="extended" style={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => props.history.replace('/api')}>
                                            <Icon>memory</Icon>
                                            <span style={{ width: 8 }} />
                                            API
                                        </Fab>
                                        <Login setIdentity={async (identity) => await reset(identity) } onComplete={() => props.history.replace('/')} />
                                    </NavigationLayout>
                                </React.Fragment> :
                                state.auth.type !== 'participant' ? 
                                <Redirect to="/" /> :
                                <React.Fragment>
                                    <PageTitle>mindLAMP</PageTitle>
                                    <AppHome {...props} 
                                        auth={{ ...state }} 
                                        setIdentity={async (identity) => await reset(identity) } 
                                    />
                                </React.Fragment>
                            } />

                            {/* Route API documentation ONLY. */}
                            <Route exact path="/api" render={props =>
                                <React.Fragment>
                                    <PageTitle>LAMP API</PageTitle>
                                    <Fab color="primary" aria-label="Back" variant="extended" style={{ position: 'fixed', top: 24, left: 24 }} onClick={() => reset()}>
                                        <Icon>arrow_back</Icon>
                                        <span style={{ width: 8 }} />
                                        Back
                                    </Fab>
                                    <div style={{ height: 56 }}></div>
                                    <SwaggerUI url="https://api.lamp.digital/" docExpansion="list" />
                                </React.Fragment>
                            } />
                        </Switch>
                    </HashRouter>
                    {!!deferredPrompt && 
                    <Snackbar
                        open
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        message="Add mindLAMP to your home screen?"
                        action={<Button color="inherit" size="small" onClick={promptInstall}>Install</Button>}
                    />}
                </SnackbarProvider>
            </MuiPickersUtilsProvider>
        </ThemeProvider>
    )
}
