// Core Imports
import React from "react"
import { Typography, makeStyles, Box, Grid, colors, CardContent } from "@material-ui/core"
import LAMP, { Participant as ParticipantObj, Activity as ActivityObj } from "lamp-core"
import Sparkline from "./Sparkline"
import ActivityCard from "./ActivityCard"
import { useTranslation } from "react-i18next"
import ReactMarkdown from "react-markdown"
import emoji from "remark-emoji"
import gfm from "remark-gfm"

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  moodContent: {
    padding: 17,
    "& h4": { fontSize: 25, color: "rgba(0, 0, 0, 0.75)", fontWeight: 600, marginBottom: 40 },
    "& h5": {
      fontSize: 18,
      color: "rgba(0, 0, 0, 0.75)",
      fontWeight: 600,
      marginBottom: 20,
      "& span": { color: "#ff8f26" },
    },
  },
  graphcontainer: { height: "auto" },
}))

function createData(dateVal: string, timeVal: string, value: number) {
  return { dateVal, timeVal, value }
}

function _hideExperimental() {
  return (LAMP.Auth._auth.serverAddress || "").includes(".psych.digital")
}

export default function PreventData({
  activity,
  events,
  graphType,
  earliestDate,
  enableEditMode,
  onEditAction,
  onCopyAction,
  onDeleteAction,
  ...props
}: {
  activity: any
  events: any
  graphType: number
  earliestDate: any
  enableEditMode: boolean
  onEditAction: (activity: ActivityObj, data: any) => void
  onCopyAction: (activity: ActivityObj, data: any) => void
  onDeleteAction: (activity: ActivityObj, data: any) => void
}) {
  const classes = useStyles()
  const { t } = useTranslation()
  return (
    <Grid container direction="row" justify="center" alignItems="flex-start">
      <Grid item lg={4} sm={10} xs={12}>
        <CardContent className={classes.moodContent}>
          <Typography variant="h5">{t("Summary")}</Typography>
          <Typography variant="body2">
            {/*You have a good distribution of locations, which means you’re getting out of the house and doing things.
            Studies show a change of scenery helps keep the mid engaged and positive.*/}
          </Typography>
        </CardContent>

        <Box
          className={classes.graphcontainer}
          style={{ marginTop: 16, marginBottom: 16, overflow: "visible", breakInside: "avoid" }}
        >
          {graphType === 1 ? (
            <div />
          ) : /*<RadialDonutChart data={events} type={type} detailPage={true} width={370} height={350} />*/
          graphType === 2 ? (
            <Sparkline
              minWidth={250}
              minHeight={450}
              XAxisLabel={t("Time")}
              YAxisLabel="  "
              color={colors.blue[500]}
              data={events}
            />
          ) : (
            <ActivityCard
              activity={activity}
              events={events}
              startDate={earliestDate}
              forceDefaultGrid={_hideExperimental()}
              onEditAction={
                activity.spec !== "lamp.survey" || !enableEditMode ? undefined : (data) => onEditAction(activity, data)
              }
              onCopyAction={
                activity.spec !== "lamp.survey" || !enableEditMode ? undefined : (data) => onCopyAction(activity, data)
              }
              onDeleteAction={
                activity.spec !== "lamp.survey" || !enableEditMode
                  ? undefined
                  : (data) => onDeleteAction(activity, data)
              }
            />
          )}
        </Box>
      </Grid>
    </Grid>
  )
}
