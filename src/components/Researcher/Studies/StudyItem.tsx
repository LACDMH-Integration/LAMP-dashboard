import React from "react"
import {
  Fab,
  Icon,
  Card,
  CardHeader,
  CardActions,
  CardContent,
  Box,
  makeStyles,
  Theme,
  createStyles,
  Chip,
} from "@material-ui/core"
import DeleteStudy from "./DeleteStudy"
import EditStudy from "./EditStudy"
import { saveData } from "../SaveResearcherData"
import LAMP from "lamp-core"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbardashboard: {
      minHeight: 100,
      padding: "0 10px",
      "& h5": {
        color: "rgba(0, 0, 0, 0.75)",
        textAlign: "left",
        fontWeight: "600",
        fontSize: 30,
        width: "calc(100% - 96px)",
      },
    },
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
    },
    backdrop: {
      zIndex: 111111,
      color: "#fff",
    },
    cardMain: {
      boxShadow: "none !important ",
      background: "#F8F8F8",
      "& span.MuiCardHeader-title": { fontSize: "16px", fontWeight: 500 },
    },
    checkboxActive: { color: "#7599FF !important" },
    participantHeader: { padding: "12px 5px 0" },
    moreBtn: {},
    participantSub: {
      padding: "0 5px",
      "&:last-child": { paddingBottom: 10 },
      "& div": { margin: 5 },
    },
    btnWhite: {
      background: "#fff",
      borderRadius: "40px",
      boxShadow: "none",
      cursor: "pointer",
      textTransform: "capitalize",
      fontSize: "14px",
      color: "#7599FF",
      "& svg": { marginRight: 8 },
      "&:hover": { color: "#5680f9", background: "#fff", boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)" },
    },
  })
)

export default function StudyItem({ study, allStudies, onStudySelect, setStudies, ...props }) {
  const classes = useStyles()

  const saveStudyData = async () => {
    let lampAuthId = LAMP.Auth._auth.id
    let lampAuthPswd = LAMP.Auth._auth.password
    await saveData(lampAuthId + ":" + lampAuthPswd, study.id)
  }

  return (
    <Card className={classes.cardMain}>
      <Box display="flex" p={1}>
        <Box flexGrow={1}>
          <CardHeader
            title={<EditStudy study={study} allStudies={allStudies} />}
            className={classes.participantHeader}
          />
          <CardContent className={classes.participantSub}>
            {console.log(study)}
            <Chip label={`Participants(${study.participant_count ?? 0})`} variant="outlined" />
            <Chip label={`Activities(${study.activity_count ?? 0})`} variant="outlined" />
            <Chip label={`Sensors(${study.sensor_count ?? 0})`} variant="outlined" />
          </CardContent>
        </Box>
        <Box>
          <CardActions>
            <DeleteStudy study={study} setStudies={setStudies} />
            <Fab
              size="small"
              classes={{ root: classes.btnWhite }}
              onClick={() => {
                saveStudyData()
                onStudySelect()
              }}
            >
              <Icon>arrow_forward</Icon>
            </Fab>
          </CardActions>
        </Box>
      </Box>
    </Card>
  )
}
