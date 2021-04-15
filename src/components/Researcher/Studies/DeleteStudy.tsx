import React, { useState } from "react"
import {
  Box,
  Icon,
  Button,
  Fab,
  Dialog,
  DialogContent,
  DialogActions,
  makeStyles,
  Theme,
  createStyles,
} from "@material-ui/core"
import { useSnackbar } from "notistack"
import LAMP, { Study } from "lamp-core"
import { useTranslation } from "react-i18next"
import { Service } from "../../DBService/DBService"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    disabledButton: {
      color: "#4C66D6 !important",
      opacity: 0.5,
    },
    activityContent: {
      padding: "25px 50px 0",
    },
    manageStudyDialog: { maxWidth: 700 },
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
  })
)

export default function DeleteStudy({ study, setStudies, ...props }) {
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const { t } = useTranslation()
  const [openDialogDeleteStudy, setOpenDialogDeleteStudy] = useState(false)

  const deleteStudy = async () => {
    setOpenDialogDeleteStudy(false)
    await LAMP.Study.delete(study.id)
      .then((res) => {
        Service.delete("studies", [study.id])
        Service.deleteByKey("participants", [study.id], "study_id")
        Service.deleteByKey("activities", [study.id], "study_id")
        Service.deleteByKey("sensors", [study.id], "study_id")
        setStudies()
        enqueueSnackbar(t("Successfully deleted study.", { studyId: study.id }), { variant: "success" })
      })
      .catch((error) => {
        enqueueSnackbar(t("An error occured while deleting. Please try again."), { variant: "error" })
      })
  }
  return (
    <React.Fragment>
      <Box display="flex" alignItems="center" pl={1}>
        <Fab
          size="small"
          color="primary"
          disabled={study.id > 1 ? true : false}
          classes={{ root: classes.btnWhite, disabled: classes.disabledButton }}
          onClick={() => setOpenDialogDeleteStudy(true)}
        >
          <Icon>delete_outline</Icon>
        </Fab>
      </Box>

      <Dialog
        open={openDialogDeleteStudy}
        onClose={() => setOpenDialogDeleteStudy(false)}
        scroll="paper"
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
        classes={{ paper: classes.manageStudyDialog }}
      >
        <DialogContent dividers={false} classes={{ root: classes.activityContent }}>
          <Box mt={2} mb={2}>
            {t("Are you sure you want to delete this study?")}
          </Box>
          <DialogActions>
            <Box textAlign="center" width={1} mb={3}>
              <Button onClick={() => deleteStudy()} color="primary" autoFocus>
                {t("Delete")}
              </Button>

              <Button onClick={() => setOpenDialogDeleteStudy(false)}>{t("Cancel")}</Button>
            </Box>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  )
}
