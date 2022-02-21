import React, { useState, useEffect, useRef } from "react"
import { HashRouter, Route, Redirect, Switch, useLocation } from "react-router-dom"
import { CssBaseline, Button, ThemeProvider, createMuiTheme, colors, Container } from "@material-ui/core"
import { MuiPickersUtilsProvider } from "@material-ui/pickers"
import { SnackbarProvider, useSnackbar } from "notistack"
import { ErrorBoundary } from "react-error-boundary"
import StackTrace from "stacktrace-js"
import DateFnsUtils from "@date-io/date-fns"
import LAMP from "lamp-core"
import Login from "./Login"
import Messages from "./Messages"
import Root from "./Admin/Index"
import Researcher from "./Researcher/Index"
import Participant from "./Participant"
import DataPortal from "./data_portal/DataPortal"
import NavigationLayout from "./NavigationLayout"
import NotificationPage from "./NotificationPage"
import { useTranslation } from "react-i18next"
import PatientProfile from "./Researcher/ParticipantList/Profile/PatientProfilePage"
import Activity from "./Researcher/ActivityList/Activity"
import ImportActivity from "./Researcher/ActivityList/ImportActivity"
import PreventPage from "./PreventPage"
import { sensorEventUpdate } from "./BottomMenu"

function ErrorFallback({ error }) {
  const [trace, setTrace] = useState([])
  useEffect(() => {
    StackTrace.fromError(error).then(setTrace)
  }, [])
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        border: "none",
        zIndex: 2147483647,
        padding: "0.5rem",
        fontFamily: "Consolas, Menlo, monospace",
        whiteSpace: "pre-wrap",
        lineHeight: 1.5,
        fontSize: "12px",
        color: "rgb(232, 59, 70)",
        background: "rgb(53, 53, 53)",
      }}
    >
      <pre>
        <code style={{ fontSize: "16px" }}>
          {error.message.match(/^\w*:/) || !error.name ? error.message : error.name + ": " + error.message}
        </code>
        <br />
        <code style={{ color: "#fff" }}>
          {trace.length > 0 ? trace.map((x) => x.toString()).join("\n") : "Generating stacktrace..."}
        </code>
        <br />
        <code>
          mindLAMP Version: `v${process.env.REACT_APP_GIT_NUM} (${process.env.REACT_APP_GIT_SHA})`
        </code>
        <br />
        <a style={{ fontSize: "16px" }} href="javascript:void(0)" onClick={() => window.location.reload()}>
          Back to page
        </a>
      </pre>
    </div>
  )
}
function PageTitle({ children, ...props }) {
  useEffect(() => {
    document.title = `${typeof children === "string" ? children : ""}`
  })
  return <React.Fragment />
}
export const changeCase = (text) => {
  if (!!text) {
    let result = text.replace(/([A-Z])/g, " $1")
    result = text.replace(/_/g, " ")
    result = result.charAt(0).toUpperCase() + result.slice(1)
    return result
  }
  return ""
}
function AppRouter({ ...props }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const search = useLocation().search

  // To set page titile for active tab for menu
  let activeTab = (newTab?: string, participantId?: string) => {
    setState((state) => ({
      ...state,
      activeTab: newTab,
    }))
    window.location.href = `/#/participant/${participantId}/${newTab.toLowerCase()}`
  }

  let changeResearcherType = (type: string) => {
    setState((state) => ({
      ...state,
      researcherType: type,
    }))
  }
  const [state, setState] = useState({
    identity: LAMP.Auth._me,
    auth: LAMP.Auth._auth,
    authType: LAMP.Auth._type,
    lastDomain: undefined,
    activeTab: null,
    surveyDone: false,
    welcome: true,
    messageCount: 0,
    researcherType: "clinician",
    adminType: "admin",
  })
  const [store, setStore] = useState({ researchers: [], participants: [] })
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const storeRef = useRef([])
  const [showDemoMessage, setShowDemoMessage] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    document.addEventListener("visibilitychange", function logData() {
      if (document.visibilityState === "hidden") {
        sensorEventUpdate(null, LAMP.Auth._auth.id, null)
      } else {
        let hrefloc = window.location.href.split("/")[window.location.href.split("/").length - 1]
        hrefloc.split("?").length > 1
          ? sensorEventUpdate(state.activeTab, LAMP.Auth._auth.id, hrefloc.split("?")[0])
          : sensorEventUpdate(hrefloc.split("?")[0], LAMP.Auth._auth.id, null)
      }
    })
    let query = window.location.hash.split("?")
    if (!!query && query.length > 1) {
      let src = Object.fromEntries(new URLSearchParams(query[1]))["src"]
      if (typeof src === "string" && src.length > 0) {
        enqueueSnackbar(t("You're using the src server to log into mindLAMP.", { src: src }), { variant: "info" })
      }
      let values = Object.fromEntries(new URLSearchParams(query[1]))
      if (!!values["mode"]) {
        refreshPage()
        return
      }
      let a = Object.fromEntries(new URLSearchParams(query[1]))["a"]
      if (a === undefined) window.location.href = "/#/"
      let x = atob(a).split(":")
      //
      reset({
        id: x[0],
        password: x[1],
        serverAddress:
          x.length > 2 && typeof x[2] !== "undefined"
            ? x[2] + (x.length > 3 && typeof x[3] !== "undefined" ? ":" + x[3] : "")
            : "api.lamp.digital",
      }).then((x) => {
        window.location.href = query[0]
      })
    } else if (!state.identity) {
      refreshPage()
    }
    window.addEventListener("beforeinstallprompt", (e) => setDeferredPrompt(e))
  }, [])

  const refreshPage = () => {
    LAMP.Auth.refresh_identity().then((x) => {
      getAdminType()
      setState((state) => ({
        ...state,
        identity: LAMP.Auth._me,
        auth: LAMP.Auth._auth,
        authType: LAMP.Auth._type,
      }))
    })
  }

  const getAdminType = () => {
    LAMP.Type.getAttachment(null, "lamp.dashboard.admin_permissions").then((res: any) => {
      if (!!res.data) {
        let checked = false
        Object.keys(res.data).map((key) => {
          if (res.data[key].hasOwnProperty(LAMP.Auth._auth.id)) {
            const id = Object.keys(res.data[key])[0]
            checked = true
            setState((state) => ({
              ...state,
              adminType:
                res.data[key][id] === "view" ? "practice_lead" : res.data[key][id] === "edit" ? "user_admin" : "admin",
            }))
          }
        })
        if (!checked) {
          setState((state) => ({
            ...state,
            adminType: "admin",
          }))
        }
      } else {
        setState((state) => ({
          ...state,
          adminType: "admin",
        }))
      }
    })
  }

  useEffect(() => {
    if (!deferredPrompt) return
    enqueueSnackbar(t("Add mindLAMP to your home screen?"), {
      variant: "info",
      persist: true,
      action: (key) => (
        <React.Fragment>
          <Button style={{ color: "#fff" }} onClick={promptInstall}>
            {t("Install")}
          </Button>
          <Button style={{ color: "#fff" }} onClick={() => closeSnackbar(key)}>
            {t("Dismiss")}
          </Button>
        </React.Fragment>
      ),
    })
  }, [deferredPrompt])

  useEffect(() => {
    closeSnackbar("admin")
    if (!showDemoMessage) closeSnackbar("demo")
    if (!!state.identity && state.authType === "admin") {
      enqueueSnackbar(t("Proceed with caution: you are logged in as the administrator."), {
        key: "admin",
        variant: "info",
        persist: true,
        preventDuplicate: true,
        action: (key) => (
          <Button style={{ color: "#fff" }} onClick={() => closeSnackbar(key)}>
            {t("Dismiss")}
          </Button>
        ),
      })
    } else if (showDemoMessage && state.auth?.serverAddress === "demo.lamp.digital") {
      enqueueSnackbar(
        t("You're logged into a demo account. Any changes you make will be reset when you restart the app."),
        {
          key: "demo",
          variant: "info",
          persist: true,
          preventDuplicate: true,
          action: (key) => (
            <Button style={{ color: "#fff" }} onClick={() => closeSnackbar(key)}>
              {t("Dismiss")}
            </Button>
          ),
        }
      )
    }
  }, [state])

  let reset = async (identity?: any) => {
    if (typeof identity === "undefined") {
      sensorEventUpdate(null, LAMP.Auth._auth.id, null)
    }
    await LAMP.Auth.set_identity(identity).catch((e) => {
      enqueueSnackbar(t("Invalid id or password."), {
        variant: "error",
      })
      return
    })
    if (!!identity) {
      getAdminType()
      let type = {
        identity: LAMP.Auth._me,
        auth: LAMP.Auth._auth,
        authType: LAMP.Auth._type,
      }
      setState((state) => ({ ...state, ...type }))
      return type
    } else {
      setState((state) => ({
        ...state,
        identity: null,
        auth: null,
        authType: null,
        activeTab: null,
        lastDomain: ["api.lamp.digital", "demo.lamp.digital"].includes(state.auth.serverAddress)
          ? undefined
          : state.auth.serverAddress,
      }))
      return null
    }
  }

  let getResearcher = (id) => {
    if (id === "me" && state.authType === "researcher" && !Array.isArray(state.identity)) {
      id = state.identity.id
    }
    if (!id || id === "me") {
      return null //props.history.replace(`/`)
    }
    if (!!store.researchers[id]) {
      return store.researchers[id]
    } else if (!storeRef.current.includes(id)) {
      LAMP.Researcher.view(id).then((x) => {
        setStore({
          researchers: { ...store.researchers, [id]: x },
          participants: store.participants,
        })
      })
      storeRef.current = [...storeRef.current, id]
    }
    return null
  }

  let getParticipant = (id) => {
    if (id === "me" && state.authType === "participant" && !Array.isArray(state.identity)) {
      id = state.identity.id
    }
    if (!id || id === "me") {
      return null //props.history.replace(`/`)
    }
    if (!!store.participants[id]) {
      return store.participants[id]
    } else if (!storeRef.current.includes(id)) {
      LAMP.Participant.view(id).then((x) =>
        setStore({
          researchers: store.researchers,
          participants: { ...store.participants, [id]: x },
        })
      )
      storeRef.current = [...storeRef.current, id]
    }
    return null
  }

  const submitSurvey = () => {
    setState((state) => ({
      ...state,
      surveyDone: true,
    }))
  }

  const promptInstall = () => {
    if (deferredPrompt === null) return
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then((c) => {
      if (c.outcome === "accepted") {
        enqueueSnackbar(t("mindLAMP will be installed on your device."), {
          variant: "info",
        })
      } else {
        enqueueSnackbar(t("mindLAMP will not be installed on your device."), {
          variant: "warning",
        })
      }
      setDeferredPrompt(null)
    })
  }

  const updateStore = (id: string) => {
    if (!!store.researchers[id]) {
      LAMP.Researcher.view(id).then((x) => {
        setStore({
          researchers: { ...store.researchers, [id]: x },
          participants: store.participants,
        })
      })
    }
  }

  return (
    <Switch>
      <Route
        exact
        path="/participant/:id/messages"
        render={(props) =>
          !state.identity ? (
            <React.Fragment>
              <PageTitle>mindLAMP | {t("Login")}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <PageTitle>mindLAMP | {t("Messages")}</PageTitle>
              <Messages
                style={{ margin: "0px -16px -16px -16px" }}
                refresh={true}
                participantOnly
                participant={getParticipant(props.match.params.id)?.id ?? null}
              />
            </React.Fragment>
          )
        }
      />

      <Route
        exact
        path="/participant/:id/activity/:activityId"
        render={(props) =>
          !state.identity ? (
            <React.Fragment>
              <PageTitle>mindLAMP | {t("Login")}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <NotificationPage
                participant={props.match.params.id}
                activityId={props.match.params.activityId}
                mode={new URLSearchParams(search).get("mode")}
                tab={state.activeTab}
              />
            </React.Fragment>
          )
        }
      />

      <Route
        exact
        path="/researcher/:rid/activity/import"
        render={(props) =>
          !state.identity ? (
            <React.Fragment>
              <PageTitle>mindLAMP | {t("Login")}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <ImportActivity />
            </React.Fragment>
          )
        }
      />
      <Route
        exact
        path="/researcher/:rid/activity/add/:type"
        render={(props) =>
          !state.identity ? (
            <React.Fragment>
              <PageTitle>mindLAMP | {t("Login")}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Activity type={props.match.params.type} researcherId={props.match.params.rid} />
            </React.Fragment>
          )
        }
      />

      <Route
        exact
        path="/researcher/:rid/participant/:id/settings"
        render={(props) =>
          !state.identity ? (
            <React.Fragment>
              <PageTitle>mindLAMP | {t("Login")}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <PatientProfile researcherId={props.match.params.rid} participantId={props.match.params.id} />
            </React.Fragment>
          )
        }
      />
      <Route
        exact
        path="/researcher/:rid/activity/:id"
        render={(props) =>
          !state.identity ? (
            <React.Fragment>
              <PageTitle>mindLAMP | {t("Login")}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Activity id={props.match.params.id} researcherId={props.match.params.rid} />
            </React.Fragment>
          )
        }
      />
      {/* Route index => login or home (which redirects based on user type). */}
      <Route
        exact
        path="/"
        render={(props) =>
          !(window.location.hash.split("?").length > 1 && !state.identity) ? (
            !state.identity ? (
              <React.Fragment>
                <PageTitle>mindLAMP | {t("Login")}</PageTitle>
                <Login
                  setIdentity={async (identity) => await reset(identity)}
                  lastDomain={state.lastDomain}
                  onComplete={() => props.history.replace("/")}
                />
              </React.Fragment>
            ) : state.authType === "admin" ? (
              <Redirect to="/researcher" />
            ) : state.authType === "researcher" ? (
              <Redirect to="/researcher/me/users" />
            ) : (
              <Redirect to="/participant/me/assess" />
            )
          ) : (
            <React.Fragment />
          )
        }
      />

      {/* Route authenticated routes. */}
      <Route
        exact
        path="/researcher"
        render={(props) =>
          !state.identity || state.authType !== "admin" ? (
            <React.Fragment>
              <PageTitle>mindLAMP | {t("Login")}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <PageTitle>{t("Administrator")}</PageTitle>
              <NavigationLayout
                authType={state.authType}
                title={
                  state.adminType === "admin"
                    ? "Administrator"
                    : state.adminType === "practice_lead"
                    ? "Practice Lead"
                    : "User Administrator"
                }
                goBack={props.history.goBack}
                onLogout={() => reset()}
              >
                <Root {...props} updateStore={updateStore} adminType={state.adminType} />
              </NavigationLayout>
            </React.Fragment>
          )
        }
      />
      <Route
        exact
        path="/researcher/:id/:tab"
        render={(props) =>
          !state.identity ? (
            <React.Fragment>
              <PageTitle>mindLAMP | {t("Login")}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : !getResearcher(props.match.params.id) ? (
            <React.Fragment />
          ) : (
            <React.Fragment>
              <PageTitle>{`${getResearcher(props.match.params.id).name}`}</PageTitle>
              <NavigationLayout
                authType={state.authType}
                id={props.match.params.id}
                title={`${getResearcher(props.match.params.id).name}`}
                goBack={props.history.goBack}
                onLogout={() => reset()}
                activeTab="Researcher"
                sameLineTitle={true}
                changeResearcherType={changeResearcherType}
              >
                <Researcher
                  researcher={getResearcher(props.match.params.id)}
                  onParticipantSelect={(id) => {
                    setState((state) => ({
                      ...state,
                      activeTab: 3,
                    }))
                    props.history.push(`/participant/${id}/portal`)
                  }}
                  mode={state.researcherType}
                  tab={props.match.params.tab}
                />
              </NavigationLayout>
            </React.Fragment>
          )
        }
      />

      <Route
        exact
        path="/data_portal"
        render={(props) =>
          !state.identity || (state.authType !== "admin" && state.authType !== "researcher") ? (
            <React.Fragment>
              <PageTitle>mindLAMP | {t("Login")}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/data_portal")}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <PageTitle>Data Portal</PageTitle>
              <DataPortal
                standalone
                token={{
                  username: LAMP.Auth._auth.id,
                  password: LAMP.Auth._auth.password,
                  server: LAMP.Auth._auth.serverAddress ? LAMP.Auth._auth.serverAddress : "api.lamp.digital",
                  type: state.authType === "admin" ? "Administrator" : "Researcher",
                  //@ts-ignore: state.identity will have an id param if not admin
                  id: state.authType === "admin" ? null : state.identity.id,
                  //@ts-ignore: state.identity will have an name param if not admin
                  name: state.authType === "admin" ? "Administrator" : state.identity.name,
                }}
                onLogout={() => reset()}
              />
            </React.Fragment>
          )
        }
      />

      <Route
        exact
        path="/participant/:id/:tab"
        render={(props) =>
          !state.identity ? (
            <React.Fragment>
              <PageTitle>mindLAMP | {t("Login")}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : !getParticipant(props.match.params.id) ? (
            <React.Fragment />
          ) : (
            <React.Fragment>
              <PageTitle>{t("Patient") + " " + getParticipant(props.match.params.id).id}</PageTitle>
              <NavigationLayout
                authType={state.authType}
                id={props.match.params.id}
                title={"Patient" + " " + getParticipant(props.match.params.id).id}
                goBack={props.history.goBack}
                onLogout={() => reset()}
                activeTab={state.activeTab}
              >
                <Participant
                  participant={getParticipant(props.match.params.id)}
                  activeTab={activeTab}
                  tabValue={props.match.params.tab}
                  surveyDone={state.surveyDone}
                  submitSurvey={submitSurvey}
                  setShowDemoMessage={(val) => {
                    setShowDemoMessage(val)
                  }}
                />
              </NavigationLayout>
            </React.Fragment>
          )
        }
      />

      <Route
        exact
        path="/participant/:id/portal/activity/:activityId"
        render={(props) =>
          !state.identity ? (
            <React.Fragment>
              <PageTitle>mindLAMP | {t("Login")}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : !getParticipant(props.match.params.id) ? (
            <React.Fragment />
          ) : (
            <React.Fragment>
              <PageTitle>{t("Patient") + " " + getParticipant(props.match.params.id).id}</PageTitle>
              <PreventPage
                type="activity"
                activityId={props.match.params.activityId}
                participantId={props.match.params.id}
              />
            </React.Fragment>
          )
        }
      />

      <Route
        exact
        path="/participant/:id/portal/sensor/:spec"
        render={(props) =>
          !state.identity ? (
            <React.Fragment>
              <PageTitle>mindLAMP | {t("Login")}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : !getParticipant(props.match.params.id) ? (
            <React.Fragment />
          ) : (
            <React.Fragment>
              <PageTitle>{t("Patient") + " " + getParticipant(props.match.params.id).id}</PageTitle>
              <PreventPage type="sensor" activityId={props.match.params.spec} participantId={props.match.params.id} />
            </React.Fragment>
          )
        }
      />
    </Switch>
  )
}

export default function App({ ...props }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider
        theme={createMuiTheme({
          typography: {
            fontFamily: ["Inter", "Roboto", "Helvetica", "Arial", "sans-serif"].join(","),
          },
          palette: {
            primary: colors.blue,
            secondary: {
              main: "#333",
            },
            background: {
              default: "#fff",
            },
          },
          overrides: {
            MuiBottomNavigationAction: {
              label: {
                letterSpacing: `0.1em`,
                textTransform: "uppercase",
              },
            },
            MuiFilledInput: {
              root: {
                border: 0,
                backgroundColor: "#f4f4f4",
              },
              underline: {
                "&&&:before": {
                  borderBottom: "none",
                },
                "&&:after": {
                  borderBottom: "none",
                },
              },
            },
            MuiTextField: {
              root: { width: "100%" },
            },
            MuiTableCell: {
              root: {
                borderBottom: "#fff solid 1px",
                padding: 10,
              },
            },
            MuiTypography: {
              h6: { fontSize: 16, fontWeight: 600 },
            },
            MuiDivider: {
              root: { margin: "25px 0" },
            },
            MuiStepper: {
              root: { paddingLeft: 8 },
            },
          },
        })}
      >
        <CssBaseline />
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <SnackbarProvider>
            <HashRouter>
              <AppRouter {...props} />
            </HashRouter>
          </SnackbarProvider>
        </MuiPickersUtilsProvider>
        <span
          style={{
            position: "fixed",
            bottom: 16,
            left: 16,
            fontSize: "8",
            zIndex: -1,
            opacity: 0.1,
          }}
        >
          {`v${process.env.REACT_APP_GIT_NUM} (${process.env.REACT_APP_GIT_SHA})`}
        </span>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
