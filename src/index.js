import LAMP from './lamp';
import AppHome from './appUI/home';
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Redirect, Switch } from 'react-router-dom';
import Login from './pages/login.js';
import Register from './components/register.js';
import Forms from './pages/forms.js';
import Root from './pages/root.js';
import Researcher from './pages/researcher.js';
import Participant from './pages/participant.js';
import NavigationLayout from './components/navigation_layout.js';
import CssBaseline from '@material-ui/core/CssBaseline';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import {blue, red} from '@material-ui/core/colors';
import Fab from '@material-ui/core/Fab'
import Icon from '@material-ui/core/Icon'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

// Synchronously load CSS from a remote URL from within JS.
document.loadCSS = (url) => {
    if (!document.loadedCSS) 
        document.loadedCSS = []
    if (document.loadedCSS.includes(url))
        return

    console.log('Loading CSS: ' + url)
    var element = document.createElement('link')
    element.setAttribute('rel', 'stylesheet')
    element.setAttribute('type', 'text/css')
    element.setAttribute('href', url)

    document.head.appendChild(element)
    document.loadedCSS.push(url)
}

// Configure the UI theme settings.
const theme = {
    typography: {
    useNextVariants: true,
  },
    palette: {
        primary: blue,
        secondary: red,
    },
    appBar: {
        height: 48,
    }, 
    ripple: {
        color: red,
    }
};

// Connect to the correct LAMP API server.
LAMP.connect('https://api.lamp.digital')

// Load the Roboto fonts.
document.loadCSS('https://fonts.googleapis.com/css?family=Roboto:300,400,500')
document.title = 'LAMP'

// Correctly route all pages based on available (LAMP) authorization.
ReactDOM.render((
<MuiThemeProvider theme={createMuiTheme(theme)}>
	<CssBaseline />
    <HashRouter>
        <Switch>

            {/* Route index => login or home (which redirects based on user type). */}
            <Route exact path="/" render={() =>
                !LAMP.get_identity() ?
                <Redirect to="/login" /> :
                <Redirect to="/home" />
            } />
            <Route exact path="/home" render={() =>
				(LAMP._auth || {type: null}).type === 'root' ?
                <Redirect to="/researcher" /> :
                (LAMP._auth || {type: null}).type === 'researcher' ?
                <Redirect to="/researcher/me" /> :
                <Redirect to="/participant/me" />
			} />

            {/* Route login, register, and logout. */}
            <Route exact path="/login" render={props =>
                !LAMP.get_identity() ?
				<NavigationLayout noToolbar>
                    <Fab color="primary" aria-label="Back" variant="extended" style={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => props.history.replace('/api')}>
                        <Icon>memory</Icon>
                        API
                    </Fab>
					<Login />
				</NavigationLayout> :
                <Redirect to="/home" />
            } />
            <Route exact path="/register" render={props =>
                !LAMP.get_identity() ?
				<NavigationLayout noToolbar>
					<Register />
				</NavigationLayout> :
                <Redirect to="/home" />
            } />
            <Route exact path="/forms" render={props =>
                !LAMP.get_identity() ?
                <NavigationLayout noToolbar>
                    <Forms />
                </NavigationLayout> :
                <Redirect to="/home" />
            } />
            <Route exact path="/logout" render={() => {
                LAMP.set_identity()
                return (<Redirect to="/" />)
            }} />

            {/* Route authenticated routes. */}
			<Route exact path="/researcher" render={props =>
				!LAMP.get_identity() ?
                <Redirect to="/login" /> :
                <NavigationLayout profile={(LAMP._auth || {type: null}).type === 'root' ? {} : LAMP.get_identity()}>
                    <Root {...props} />
                </NavigationLayout>
			} />
            <Route exact path="/researcher/:id" render={props =>
                !LAMP.get_identity() ?
                <Redirect to="/login" /> :
                <NavigationLayout profile={(LAMP._auth || {type: null}).type === 'root' ? {} : LAMP.get_identity()}>
                    <Researcher {...props} />
                </NavigationLayout>
            } />

            <Route exact path="/participant/:id" render={props =>
                !LAMP.get_identity() ? 
                <Redirect to="/login" /> :
                <NavigationLayout profile={(LAMP._auth || {type: null}).type === 'root' ? {} : LAMP.get_identity()}>
                    <Participant {...props} />
                </NavigationLayout>
            } />

            {/* Route to the app home screen. [TODO] */}
            <Route exact path="/app" render={() =>
                <AppHome />
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
</MuiThemeProvider>
), document.getElementById('root'))
