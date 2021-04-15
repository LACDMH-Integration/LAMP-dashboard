import React, { useState, useEffect } from "react"
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  useMediaQuery,
  useTheme,
  makeStyles,
  Theme,
  createStyles,
} from "@material-ui/core"
import ParticipantList from "./ParticipantList/Index"
import ActivityList from "./ActivityList/Index"
import SensorsList from "./SensorsList/Index"
import { ResponsivePaper } from "../../Utils"
import { ReactComponent as Patients } from "../../../icons/Patients.svg"
import { ReactComponent as Activities } from "../../../icons/Activities.svg"
import { ReactComponent as Sensors } from "../../../icons/Sensor.svg"
import { useTranslation } from "react-i18next"
import { Service } from "../../DBService/DBService"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    researcherMenu: {
      background: "#F8F8F8",
      maxWidth: 100,
      border: 0,
      [theme.breakpoints.down("sm")]: {
        maxWidth: "100%",
      },
      "& span": { fontSize: 12 },
      "& div.Mui-selected": { backgroundColor: "transparent", color: "#5784EE", "& path": { fill: "#5784EE" } },
    },
    menuItems: {
      display: "inline-block",
      textAlign: "center",
      color: "rgba(0, 0, 0, 0.4)",
      paddingTop: 40,
      paddingBottom: 30,
      [theme.breakpoints.down("sm")]: {
        paddingTop: 16,
        paddingBottom: 9,
      },
      [theme.breakpoints.down("xs")]: {
        padding: 6,
      },
    },
    menuIcon: {
      minWidth: "auto",
      [theme.breakpoints.down("xs")]: {
        top: 5,
        position: "relative",
      },
      "& path": { fill: "rgba(0, 0, 0, 0.4)", fillOpacity: 0.7 },
    },
    tableContainerWidth: {
      maxWidth: 1055,
      width: "80%",
      [theme.breakpoints.down("md")]: {
        padding: 0,
      },
      [theme.breakpoints.down("sm")]: {
        width: "100%",
      },
    },
    tableContainerWidthPad: {
      maxWidth: 1055,
      paddingLeft: 0,
      paddingRight: 0,
    },
    menuOuter: {
      paddingTop: 0,
      [theme.breakpoints.down("sm")]: {
        display: "flex",
        padding: 0,
      },
    },
    logResearcher: {
      marginTop: 50,
      zIndex: 1111,
      [theme.breakpoints.up("md")]: {
        height: "calc(100vh - 55px)",
      },
      [theme.breakpoints.down("sm")]: {
        borderBottom: "#7599FF solid 5px",
        borderRight: "#7599FF solid 5px",
      },
    },
    btnCursor: {
      "&:hover div": {
        cursor: "pointer !important",
      },
      "&:hover div > svg": {
        cursor: "pointer !important",
      },
      "&:hover div > svg > path": {
        cursor: "pointer !important",
      },
      "&:hover div > span": {
        cursor: "pointer !important",
      },
    },
  })
)

export const sortData = (data, studies, key) => {
  let result = []
  studies.map((study) => {
    let filteredData = data.filter((d) => d.study_name === study)
    filteredData.sort((a, b) => {
      return a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0
    })
    result = result.concat(filteredData)
  })
  return result
}

export default function StudyDashboard({ onParticipantSelect, researcher, id, study, ...props }) {
  const [currentTab, setCurrentTab] = useState(-1)
  const [notificationColumn, setNotification] = useState(false)
  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))
  const classes = useStyles()
  const { t } = useTranslation()

  useEffect(() => {
    setCurrentTab(0)
    Service.getAll("researcher").then((data) => {
      let researcherNotification = !!data ? data[0]?.notification ?? false : false
      setNotification(researcherNotification)
    })
  }, [])

  return (
    <Container maxWidth={false}>
      <Container
        className={
          window.innerWidth >= 1280 && window.innerWidth <= 1350
            ? classes.tableContainerWidthPad
            : classes.tableContainerWidth
        }
      >
        <ResponsivePaper elevation={0}>
          <Drawer
            anchor={supportsSidebar ? "left" : "bottom"}
            variant="permanent"
            classes={{
              paper: classes.researcherMenu + " " + classes.logResearcher,
            }}
          >
            <List component="nav" className={classes.menuOuter}>
              <ListItem
                className={classes.menuItems + " " + classes.btnCursor}
                button
                selected={currentTab === 0}
                onClick={(event) => setCurrentTab(0)}
              >
                <ListItemIcon className={classes.menuIcon}>
                  <Patients />
                </ListItemIcon>
                <ListItemText primary={t("Users")} />
              </ListItem>
              <ListItem
                className={classes.menuItems + " " + classes.btnCursor}
                button
                selected={currentTab === 1}
                onClick={(event) => setCurrentTab(1)}
              >
                <ListItemIcon className={classes.menuIcon}>
                  <Activities />
                </ListItemIcon>
                <ListItemText primary={t("Activities")} />
              </ListItem>
              <ListItem
                className={classes.menuItems + " " + classes.btnCursor}
                button
                selected={currentTab === 2}
                onClick={(event) => setCurrentTab(2)}
              >
                <ListItemIcon className={classes.menuIcon}>
                  <Sensors />
                </ListItemIcon>
                <ListItemText primary={t("Sensors")} />
              </ListItem>
            </List>
          </Drawer>
          {currentTab === 0 && (
            <ParticipantList
              title={null}
              onParticipantSelect={onParticipantSelect}
              researcher={researcher}
              notificationColumn={notificationColumn}
              selectedStudy={id}
              study={study}
            />
          )}
          {currentTab === 1 && <ActivityList title={null} researcher={researcher} selectedStudy={id} study={study} />}
          {currentTab === 2 && <SensorsList title={null} researcher={researcher} selectedStudy={id} study={study} />}
        </ResponsivePaper>
      </Container>
    </Container>
  )
}
