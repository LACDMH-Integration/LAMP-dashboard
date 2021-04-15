import React, { useState } from "react"
import { Backdrop, CircularProgress } from "@material-ui/core"
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles"
import SurveyCreator from "./SurveyCreator"
import GroupCreator from "./GroupCreator"
import Tips from "./Tips"
import GameCreator from "./GameCreator"
import DBTCreator from "./DBTCreator"
import {
  saveGroupActivity,
  saveTipActivity,
  saveSurveyActivity,
  saveCTestActivity,
  addActivity,
} from "../ActivityList/ActivityMethods"
import { useSnackbar } from "notistack"
import { useTranslation } from "react-i18next"

const games = [
  "lamp.jewels_a",
  "lamp.jewels_b",
  "lamp.spatial_span",
  "lamp.cats_and_dogs",
  "lamp.pop_the_bubbles",
  "lamp.balloon_risk",
]

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    backdrop: {
      zIndex: 111111,
      color: "#fff",
    },
  })
)

export default function Activity({
  allActivities,
  activity,
  onSave,
  onCancel,
  details,
  activitySpecId,
  studyId,
  onClose,
  setActivities,
  openWindow,
  selectedStudy,
  study,
  ...props
}: {
  allActivities?: Array<JSON>
  activity?: any
  onSave?: Function
  onCancel?: Function
  details?: JSON
  activitySpecId?: string
  studyId?: string
  onClose?: Function
  setActivities?: Function
  openWindow?: Boolean
  selectedStudy?: string
  study: any
}) {
  const [loading, setLoading] = useState(false)
  const isTip = (activity || {}).spec === "lamp.tips" || activitySpecId === "lamp.tips"
  const isGroup = (activity || {}).spec === "lamp.group" || activitySpecId === "lamp.group"
  const isSurvey = (activity || {}).spec === "lamp.survey" || activitySpecId === "lamp.survey"
  const isGames = games.includes((activity || {}).spec) || games.includes(activitySpecId)
  const isJournal = (activity || {}).spec === "lamp.journal" || activitySpecId === "lamp.journal"
  const isBreathe = (activity || {}).spec === "lamp.breathe" || activitySpecId === "lamp.breathe"
  const isDBT = (activity || {}).spec === "lamp.dbt_diary_card" || activitySpecId === "lamp.dbt_diary_card"
  const isSCImage = (activity || {}).spec === "lamp.scratch_image" || activitySpecId === "lamp.scratch_image"
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const classes = useStyles()
  // Create a new tip activity object & survey descriptions if set.
  const saveTipsActivity = async (x) => {
    setLoading(true)
    let result = await saveTipActivity(x)
    if (!!result.error)
      enqueueSnackbar(t("Encountered an error: ") + result?.error, {
        variant: "error",
      })
    else {
      x["id"] = result["data"]
      updateDb(x)
      enqueueSnackbar(t("Successfully updated the Activity."), {
        variant: "success",
      })
      onClose()
    }
  }
  // Create a new Activity object & survey descriptions if set.
  const saveActivity = async (x) => {
    setLoading(true)
    let newItem = await saveSurveyActivity(x)
    if (!!newItem.error)
      enqueueSnackbar(t("Failed to create a new survey Activity."), {
        variant: "error",
      })
    else {
      x["id"] = newItem["data"]
      updateDb(x)
      enqueueSnackbar(t("Successfully created a new survey Activity."), {
        variant: "success",
      })
      onClose()
    }
  }
  // Create a new group activity object that represents a group of other Activities.
  const saveGroup = async (x) => {
    setLoading(true)
    let newItem = await saveGroupActivity(x)
    if (!!newItem.error)
      enqueueSnackbar(t("Failed to create a new group Activity."), {
        variant: "error",
      })
    else {
      x["id"] = newItem["data"]
      updateDb(x)
      enqueueSnackbar(t("Successfully created a new group Activity."), {
        variant: "success",
      })
      onClose()
    }
  }

  // Create a new Activity object that represents a cognitive test.
  const saveCTest = async (x) => {
    setLoading(true)
    let newItem = await saveCTestActivity(x)
    if (!!newItem.error)
      enqueueSnackbar(t("Failed to create a new Activity."), {
        variant: "error",
      })
    else {
      x["id"] = newItem["data"]
      updateDb(x)
      enqueueSnackbar(t("Successfully created a new Activity."), {
        variant: "success",
      })
      onClose()
    }
  }

  const updateDb = (x) => {
    addActivity(x, study)
    setActivities()
    setLoading(false)
  }

  const updateActivity = (x, isDuplicated) => {
    setLoading(true)
    onSave(x, isDuplicated)
    setLoading(false)
  }

  return (
    <div>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {isGroup && (
        <GroupCreator
          activities={allActivities}
          value={activity ?? null}
          onSave={activitySpecId ? saveGroup : updateActivity}
          study={studyId ?? activity?.study_id ?? selectedStudy}
          details={details ?? null}
        />
      )}
      {isTip && (
        <Tips
          activities={activity}
          onSave={activity && activity.id ? updateActivity : saveTipsActivity}
          allActivities={allActivities}
          activitySpecId={activitySpecId ?? activity.spec}
          study={studyId ?? activity?.study_id ?? selectedStudy}
          openWindow={openWindow}
        />
      )}

      {isSurvey && (
        <SurveyCreator
          value={activity ?? null}
          activities={allActivities}
          onSave={activitySpecId ? saveActivity : updateActivity}
          study={studyId ?? activity?.study_id ?? selectedStudy}
          details={details ?? null}
        />
      )}
      {(isGames || isSCImage || isJournal || isBreathe) && (
        <GameCreator
          activities={allActivities}
          value={activity ?? null}
          details={details ?? null}
          onSave={activitySpecId ? saveCTest : updateActivity}
          activitySpecId={activitySpecId ?? activity.spec}
          study={studyId ?? activity?.study_id ?? selectedStudy}
        />
      )}
      {isDBT && (
        <DBTCreator
          value={activity ?? null}
          onSave={activitySpecId ? saveCTest : updateActivity}
          details={details}
          activities={allActivities}
          onCancel={onCancel}
          activitySpecId={activitySpecId ?? activity.spec}
          study={studyId ?? activity?.study_id ?? selectedStudy}
        />
      )}
    </div>
  )
}
