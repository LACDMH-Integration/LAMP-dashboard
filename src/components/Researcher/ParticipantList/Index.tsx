import React, { useState, useEffect } from "react"
import { Box, Grid, Backdrop, CircularProgress, Icon } from "@material-ui/core"
import TimeAgo from "javascript-time-ago"
import en from "javascript-time-ago/locale/en"
import hi from "javascript-time-ago/locale/hi"
import es from "javascript-time-ago/locale/es"
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles"
import ParticipantListItem from "./ParticipantListItem"
import Header from "./Header"
import { Service } from "../../DBService/DBService"
import { sortData } from "../Dashboard"
import { useTranslation } from "react-i18next"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableContainer: {
      "& div.MuiInput-underline:before": { borderBottom: "0 !important" },
      "& div.MuiInput-underline:after": { borderBottom: "0 !important" },
      "& div.MuiInput-underline": {
        "& span.material-icons": {
          width: 21,
          height: 19,
          fontSize: 27,
          lineHeight: "23PX",
          color: "rgba(0, 0, 0, 0.4)",
        },
        "& button": { display: "none" },
      },
      [theme.breakpoints.down("sm")]: {
        marginBottom: 80,
      },
    },
    backdrop: {
      zIndex: 111111,
      color: "#fff",
    },
    norecords: {
      "& span": { marginRight: 5 },
    },
  })
)

function getCurrentLanguage(language) {
  let lang
  switch (language) {
    case "en_US":
      lang = "en-US"
      break
    case "hi_IN":
      lang = "hi-IN"
      break
    case "es_ES":
      lang = "es-ES"
      break
    default:
      lang = "en-US"
      break
  }
  return lang
}

function getCurrentLanguageCode(language) {
  let langCode
  switch (language) {
    case "en_US":
      langCode = en
      break
    case "hi_IN":
      langCode = hi
      break
    case "es_ES":
      langCode = es
      break
    default:
      langCode = en
      break
  }
  return langCode
}

export function getTimeAgo(language) {
  const currentLanguage = getCurrentLanguage(language)
  const currentLanguageCode = getCurrentLanguageCode(language)
  TimeAgo.addLocale(currentLanguageCode)
  return new TimeAgo(currentLanguage)
}

const daysSinceLast = (passive, timeAgo, t) => ({
  gpsString: passive?.gps?.timestamp ? timeAgo.format(new Date(((passive || {}).gps || {}).timestamp)) : t("Never"),
  accelString: passive?.accel?.timestamp
    ? timeAgo.format(new Date(((passive || {}).accel || {}).timestamp))
    : t("Never"),
  gps:
    (new Date().getTime() - new Date(parseInt(((passive || {}).gps || {}).timestamp)).getTime()) / (1000 * 3600 * 24),
  accel:
    (new Date().getTime() - new Date(parseInt(((passive || {}).accel || {}).timestamp)).getTime()) / (1000 * 3600 * 24),
})

export const dataQuality = (passive, timeAgo, t, classes) => ({
  title:
    t("GPS") +
    `: ${daysSinceLast(passive, timeAgo, t).gpsString}, ` +
    t("Accelerometer") +
    `: ${daysSinceLast(passive, timeAgo, t).accelString}`,
  class:
    daysSinceLast(passive, timeAgo, t).gps <= 2 && daysSinceLast(passive, timeAgo, t).accel <= 2
      ? classes.dataGreen
      : daysSinceLast(passive, timeAgo, t).gps <= 7 || daysSinceLast(passive, timeAgo, t).accel <= 7
      ? classes.dataYellow
      : daysSinceLast(passive, timeAgo, t).gps <= 30 || daysSinceLast(passive, timeAgo, t).accel <= 30
      ? classes.dataRed
      : classes.dataGrey,
})
// TODO: Traffic Lights with Last Survey Date + Login+device + # completed events
export default function ParticipantList({
  studies,
  title,
  onParticipantSelect,
  researcher,
  notificationColumn,
  selectedStudies,
  setSelectedStudies,
  ...props
}) {
  const classes = useStyles()
  const [participants, setParticipants] = useState(null)
  const [selectedParticipants, setSelectedParticipants] = useState([])
  const [search, setSearch] = useState(null)
  const [loading, setLoading] = useState(false)
  const [updateCount, setUpdateCount] = useState(0)

  const { t } = useTranslation()

  const handleChange = (participant, checked) => {
    if (checked) {
      setSelectedParticipants((prevState) => [...prevState, participant])
    } else {
      let selected = selectedParticipants.filter((item) => item.id != participant.id)
      setSelectedParticipants(selected)
    }
  }

  useEffect(() => {
    searchParticipants()
  }, [selectedStudies])

  useEffect(() => {
    searchParticipants()
  }, [search])

  const searchParticipants = () => {
    setLoading(true)
    if (selectedStudies.length > 0) {
      Service.getDataByKey("participants", selectedStudies, "study_name").then((participantData) => {
        if (search) {
          let newParticipants = participantData.filter((i) => i.name?.includes(search) || i.id?.includes(search))
          setParticipants(sortData(newParticipants, selectedStudies, "id"))
        } else {
          setParticipants(sortData(participantData, selectedStudies, "id"))
        }
        setLoading(false)
      })
    } else if (!!search && search !== "") {
      let newParticipants = participants.filter((i) => i.name?.includes(search) || i.id?.includes(search))
      setParticipants(sortData(newParticipants, studies, "id"))
      setLoading(false)
    }
    setSelectedParticipants([])
  }

  const handleSearchData = (val) => {
    setSearch(val)
  }

  return (
    <React.Fragment>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Header
        studies={studies}
        researcher={researcher}
        selectedParticipants={selectedParticipants}
        searchData={handleSearchData}
        selectedStudies={selectedStudies}
        setSelectedStudies={setSelectedStudies}
        setParticipants={searchParticipants}
        setUpdateCount={setUpdateCount}
        updateCount={updateCount}
      />
      <Box className={classes.tableContainer} py={4}>
        <Grid container spacing={3}>
          {!!participants && participants.length > 0 ? (
            participants.map((eachParticipant) => (
              <Grid item lg={6} xs={12} key={eachParticipant.id}>
                <ParticipantListItem
                  participant={eachParticipant}
                  onParticipantSelect={onParticipantSelect}
                  studies={studies}
                  notificationColumn={notificationColumn}
                  handleSelectionChange={handleChange}
                  setUpdateCount={setUpdateCount}
                />
              </Grid>
            ))
          ) : (
            <Box display="flex" alignItems="center" className={classes.norecords}>
              <Icon>info</Icon>
              {t("No Records Found")}
            </Box>
          )}
        </Grid>
      </Box>
    </React.Fragment>
  )
}
