import React, { useState } from "react"
import {
  Box,
  TextField,
  Tooltip,
  Grid,
  Icon,
  Backdrop,
  CircularProgress,
  makeStyles,
  Theme,
  createStyles,
  Fab,
} from "@material-ui/core"

import { useSnackbar } from "notistack"
import QRCode from "qrcode.react"
import LAMP from "lamp-core"
import SnackMessage from "../../../SnackMessage"
import { useTranslation } from "react-i18next"
import { Service } from "../../../DBService/DBService"

const _qrLink = (credID, password) =>
  window.location.href.split("#")[0] +
  "#/?a=" +
  btoa([credID, password, LAMP.Auth._auth.serverAddress].filter((x) => !!x).join(":"))

const useStyles = makeStyles((theme) =>
  createStyles({
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
    backdrop: {
      zIndex: 111111,
      color: "#fff",
    },
  })
)

export default function AddParticipant({
  studyId,
  setParticipants,
  ...props
}: {
  studyId: string
  setParticipants?: Function
}) {
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  let createUser = async () => {
    setLoading(true)
    let idData = ((await LAMP.Participant.create(studyId, { study_code: "001" } as any)) as any).data
    let id = typeof idData === "object" ? idData.id : idData
    let newParticipant: any = {}
    if (typeof idData === "object") {
      newParticipant = idData
    } else {
      newParticipant["id"] = idData
    }
    if (!!((await LAMP.Credential.create(id, `${id}@lamp.com`, id, "Temporary Login")) as any).error) {
      enqueueSnackbar(t("Could not create credential for id.", { id: id }), { variant: "error" })
    } else {
      newParticipant.study_id = studyId
      console.log(studyId)
      Service.getDataByKey("studies", [studyId], "id").then((study) => {
        console.log(study)
        newParticipant.study_name = study[0]?.name ?? ""
        Service.addData("participants", [newParticipant])
        Service.updateCount("studies", studyId, "participant_count")
        enqueueSnackbar(
          t("Successfully created Participant id. Tap the expand icon on the right to see credentials and details.", {
            id: id,
          }),
          {
            variant: "success",
            persist: true,
            content: (key: string, message: string) => (
              <SnackMessage id={key} message={message}>
                <TextField
                  variant="outlined"
                  size="small"
                  label={t("Temporary email address")}
                  value={`${id}@lamp.com`}
                />
                <Box style={{ height: 16 }} />
                <TextField variant="outlined" size="small" label={t("Temporary password")} value={`${id}`} />
                <Grid item>
                  <TextField
                    fullWidth
                    label={t("One-time login link")}
                    style={{ marginTop: 16 }}
                    variant="outlined"
                    value={_qrLink(`${id}@lamp.com`, id)}
                    onChange={(event) => {}}
                  />
                  <Tooltip title={t("Scan this QR code on a mobile device to automatically open a user dashboard.")}>
                    <Grid container justify="center" style={{ padding: 16 }}>
                      <QRCode size={256} level="H" value={_qrLink(`${id}@lamp.com`, id)} />
                    </Grid>
                  </Tooltip>
                </Grid>
              </SnackMessage>
            ),
          }
        )
        setParticipants()
        setLoading(false)
      })
    }
  }

  return (
    <Box>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Fab variant="extended" color="primary" classes={{ root: classes.btnBlue }} onClick={() => createUser()}>
        <Icon>add</Icon> <span className={classes.addText}>{t("Add")}</span>
      </Fab>
    </Box>
  )
}
