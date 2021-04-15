import React, { useState } from "react"
import { Box, Typography, makeStyles, Theme, createStyles } from "@material-ui/core"
import AddActivity from "./AddActivity"
import ExportActivity from "./ExportActivity"
import DeleteActivity from "./DeleteActivity"
import SearchBox from "../../../SearchBox"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    header: {
      "& h5": {
        fontSize: "30px",
        fontWeight: "bold",
      },
    },
    optionsMain: {
      background: "#ECF4FF",
      borderTop: "1px solid #C7C7C7",

      marginTop: 20,
      width: "99.4vw",
      position: "relative",
      left: "50%",
      right: "50%",
      marginLeft: "-50vw",
      marginRight: "-50vw",
    },
    optionsSub: { width: 1030, maxWidth: "80%", margin: "0 auto", padding: "10px 0" },
  })
)
export default function Header({
  researcher,
  activities,
  selectedActivities,
  searchData,
  setActivities,
  selectedStudy,
  study,
  ...props
}) {
  const classes = useStyles()

  return (
    <Box>
      <Box display="flex" className={classes.header}>
        <Box flexGrow={1} pt={1}>
          <Typography variant="h5">Activities</Typography>
        </Box>
        <SearchBox searchData={searchData} />
        <Box>
          <AddActivity
            activities={activities}
            studyId={null}
            setActivities={setActivities}
            selectedStudy={selectedStudy}
            study={study}
          />
        </Box>
      </Box>
      {selectedActivities.length > 0 && (
        <Box className={classes.optionsMain}>
          <Box className={classes.optionsSub}>
            <ExportActivity activities={selectedActivities} />
            <DeleteActivity activities={selectedActivities} setActivities={setActivities} />
          </Box>
        </Box>
      )}
    </Box>
  )
}
