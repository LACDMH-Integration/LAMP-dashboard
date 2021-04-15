import React, { useState } from "react"
import AddSensor from "./AddSensor"
import { Box, Typography, makeStyles, Theme, createStyles } from "@material-ui/core"
import DeleteSensor from "./DeleteSensor"
import SearchBox from "../../../SearchBox"
import { useTranslation } from "react-i18next"

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
  selectedSensors,
  searchData,
  setSensors,
  selectedStudy,
  study,
  ...props
}: {
  researcher?: Object
  selectedSensors?: Array<Object>
  searchData?: Function
  setSensors?: Function
  selectedStudy?: string
  study: any
}) {
  const classes = useStyles()
  const { t } = useTranslation()

  return (
    <Box>
      <Box display="flex" className={classes.header}>
        <Box flexGrow={1} pt={1}>
          <Typography variant="h5">{t("Sensors")}</Typography>
        </Box>
        <SearchBox searchData={searchData} />
        <Box>
          <AddSensor setSensors={setSensors} studyId={selectedStudy} study={study} />
        </Box>
      </Box>
      {selectedSensors.length > 0 && (
        <Box className={classes.optionsMain}>
          <Box className={classes.optionsSub}>
            <DeleteSensor sensors={selectedSensors} setSensors={setSensors} />
          </Box>
        </Box>
      )}
    </Box>
  )
}
