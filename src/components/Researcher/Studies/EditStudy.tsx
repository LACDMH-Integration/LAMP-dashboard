import React, { useState } from "react"
import { Box, Fab, Icon, makeStyles, Theme, createStyles, IconButton } from "@material-ui/core"
import { useSnackbar } from "notistack"
import EditStudyField from "./EditStudyField"
import { useTranslation } from "react-i18next"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    disabledButton: {
      color: "#4C66D6 !important",
      opacity: 0.5,
    },
    studyName: { minWidth: 200, alignItems: "center", display: "flex" },
    btnWhite: {
      background: "#fff",
      borderRadius: "40px",
      boxShadow: "none",
      cursor: "pointer",
      textTransform: "capitalize",
      fontSize: "14px",
      color: "#7599FF",

      "&:hover": { color: "#5680f9", background: "#fff", boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)" },
    },
    editBtn: {
      marginTop: "-2px",
      marginLeft: "5px",
      "&:hover": { color: "#7599FF", background: "transparent" },
      "& svg": { width: "20px", height: "20px" },
    },
  })
)

export default function EditStudy({ study, allStudies, ...props }) {
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const { t, i18n } = useTranslation()
  const [editStudy, setEditStudy] = useState(false)
  const [editStudyName, setEditStudyName] = useState("")
  const [aliasStudyName, setAliasStudyName] = useState("")

  const updateStudyName = (data) => {
    setEditStudy(false)
    setAliasStudyName(data)
  }

  const editStudyField = (selectedRows, event) => {
    setEditStudy(true)
    setEditStudyName(selectedRows)
  }

  return (
    <Box display="flex" alignItems="center">
      <Box pl={1}>
        {editStudy && study.id == editStudyName ? (
          <Box flexGrow={1} className={classes.studyName}>
            <EditStudyField
              study={study.id}
              studyName={study.name}
              editData={editStudy}
              editStudyName={editStudyName}
              updateName={updateStudyName}
              allStudies={allStudies}
            />
          </Box>
        ) : aliasStudyName && editStudyName === study.id ? (
          t(aliasStudyName)
        ) : (
          t(study.name)
        )}
      </Box>
      <Box flexGrow={1}>
        <IconButton
          className={classes.editBtn}
          size="small"
          disabled={study.id > 1 ? true : false}
          onClick={(event) => {
            editStudyField(study.id, event)
          }}
        >
          <Icon>create</Icon>
        </IconButton>
      </Box>
    </Box>
  )
}
