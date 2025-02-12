import React, { useState, useEffect } from "react"
import { Box, Typography, Grid, makeStyles, createStyles } from "@material-ui/core"
import { useTranslation } from "react-i18next"
import AddActivity from "../../ActivityList/AddActivity"
import { Service } from "../../../DBService/DBService"
import ActivityRow from "./ActivityRow"
import DeleteActivity from "../../ActivityList/DeleteActivity"
import { sortData } from "../../Dashboard"
import Pagination from "../../../PaginatedElement"

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionTitle: {
      color: "rgba(0, 0, 0, 0.75)",
      fontSize: 25,
      fontWeight: "bold",
      marginTop: 5,
    },
    contentText: {
      color: "rgba(0, 0, 0, 0.75)",
      fontWeight: "bold",
      fontSize: 14,
      marginLeft: 10,
    },
    w45: { width: 45 },
    w120: { width: 120 },
    optionsMain: {
      width: "100%",
      background: "#ECF4FF",
      borderBottom: "1px solid #C7C7C7",
      padding: "10px",
    },
    secAdd: {
      "& button": { position: "relative !important" },
    },
  })
)
export default function Activities({
  participant,
  studies,
  researcherId,
  ...props
}: {
  participant: any
  studies: any
  researcherId?: string
}) {
  const classes = useStyles()
  const [activities, setActivities] = useState(null)
  const { t } = useTranslation()
  const [selectedActivities, setSelectedActivities] = useState([])
  const [paginatedActivities, setPaginatedActivities] = useState([])
  const [rowCount, setRowCount] = useState(10)
  const [page, setPage] = useState(0)

  useEffect(() => {
    let params = JSON.parse(localStorage.getItem("profile-activities"))
    setPage(params?.page ?? 0)
    setRowCount(params?.rowCount ?? 10)
    onChangeActivities()
  }, [])

  const onChangeActivities = () => {
    Service.getDataByKey("activities", [participant.study_name], "study_name").then((activities) => {
      let result = sortData(activities, [participant.study_name], "name")
      setActivities(result)
    })
    setSelectedActivities([])
  }

  useEffect(() => {
    setPaginatedActivities((activities || []).slice(page * rowCount, page * rowCount + rowCount))
  }, [activities])

  const handleActivitySelected = (activity, checked) => {
    if (!!checked) {
      setSelectedActivities((prevState) => [...prevState, activity])
    } else {
      let selected = selectedActivities
      selected = selected.filter((item) => item.id != activity.id)
      setSelectedActivities(selected)
    }
  }

  const handleChangePage = (page: number, rowCount: number) => {
    setRowCount(rowCount)
    setPage(page)
    setPaginatedActivities(activities.slice(page * rowCount, page * rowCount + rowCount))
    localStorage.setItem("profile-activities", JSON.stringify({ page: page, rowCount: rowCount }))
  }

  return (
    <Box width={1}>
      <Box display="flex" width={1} mt={5}>
        <Box flexGrow={1}>
          <Typography className={classes.sectionTitle} style={{ marginBottom: 34 }}>
            {t("Activities")}
          </Typography>
        </Box>
        <Box className={classes.secAdd}>
          <AddActivity
            activities={activities}
            studies={studies}
            studyId={participant.study_id}
            setActivities={onChangeActivities}
          />
        </Box>
      </Box>
      {(selectedActivities || []).length > 0 && (
        <Box className={classes.optionsMain}>
          <DeleteActivity activities={selectedActivities} setActivities={onChangeActivities} profile={true} />
        </Box>
      )}
      <Grid container spacing={0}>
        <Grid item xs={12} sm={12}>
          <Box p={1}>
            {(activities ?? []).length > 0 ? (
              <Grid container>
                <Grid item className={classes.w45}></Grid>
                <Grid item xs>
                  <Typography className={classes.contentText} style={{ flex: 1 }}>
                    {t("Name")}
                  </Typography>
                </Grid>
                <Grid item xs>
                  <Typography className={classes.contentText} style={{ flex: 1 }}>
                    {t("Type")}
                  </Typography>
                </Grid>
                <Grid item xs>
                  <Typography className={classes.contentText} style={{ flex: 1 }}>
                    {t("Schedule")}
                  </Typography>
                </Grid>
                <Grid item className={classes.w120}></Grid>
              </Grid>
            ) : (
              t("No Activities")
            )}
          </Box>
          <Grid container>
            {(paginatedActivities ?? []).map((item, index) => (
              <Grid item xs={12} sm={12} key={item.id}>
                <ActivityRow
                  activities={activities}
                  activity={item}
                  studies={studies}
                  index={index}
                  handleSelected={handleActivitySelected}
                  setActivities={onChangeActivities}
                  researcherId={researcherId}
                  participantId={participant.id}
                />
              </Grid>
            ))}
            {activities !== null && (
              <Pagination
                data={activities}
                updatePage={handleChangePage}
                defaultCount={10}
                currentRowCount={rowCount}
                currentPage={page}
                type={1}
              />
            )}
          </Grid>
        </Grid>
        <Grid item xs={10} sm={2} />
      </Grid>
    </Box>
  )
}
