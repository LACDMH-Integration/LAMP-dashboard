import React from "react"
import { Box, Typography, makeStyles, Theme, createStyles, Fab, Icon } from "@material-ui/core"
import DeleteParticipant from "./DeleteParticipant"
import { useTranslation } from "react-i18next"
import SearchBox from "../../../SearchBox"
import AddParticipant from "./AddParticipant"

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
    btnBlue: {
      background: "#7599FF",
      borderRadius: "40px",
      minWidth: 100,
      boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)",
      lineHeight: "38px",
      cursor: "pointer",
      textTransform: "capitalize",
      fontSize: "16px",
      color: "#fff",
      "& svg": { marginRight: 8 },
      "&:hover": { background: "#5680f9" },
      [theme.breakpoints.up("md")]: {
        position: "absolute",
      },
      [theme.breakpoints.down("sm")]: {
        minWidth: "auto",
      },
    },
    addText: {
      [theme.breakpoints.down("sm")]: {
        display: "none",
      },
    },
  })
)

export default function Header({
  researcher,
  selectedParticipants,
  searchData,
  setParticipants,
  selectedStudy,
  ...props
}) {
  const classes = useStyles()
  const { t } = useTranslation()

  return (
    <Box>
      <Box display="flex" className={classes.header}>
        <Box flexGrow={1} pt={1}>
          <Typography variant="h5">{t("Users")}</Typography>
        </Box>
        <SearchBox searchData={searchData} />
        <Box>
          <AddParticipant setParticipants={setParticipants} studyId={selectedStudy} />
        </Box>
      </Box>
      {selectedParticipants.length > 0 && (
        <Box className={classes.optionsMain}>
          <Box className={classes.optionsSub}>
            <DeleteParticipant participants={selectedParticipants} setParticipants={setParticipants} />
          </Box>
        </Box>
      )}
    </Box>
  )
}
