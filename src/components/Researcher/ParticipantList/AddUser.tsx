import React, { useState } from "react"
import {
  Box,
  IconButton,
  Button,
  TextField,
  Popover,
  MenuItem,
  Tooltip,
  Grid,
  Fab,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  DialogProps,
} from "@material-ui/core"

import { useSnackbar } from "notistack"
import CloseIcon from "@material-ui/icons/Close"
import QRCode from "qrcode.react"
import LAMP from "lamp-core"
import SnackMessage from "../../SnackMessage"
import { makeStyles, Theme, createStyles, createMuiTheme } from "@material-ui/core/styles"
import { useTranslation } from "react-i18next"
import { Service } from "../../DBService/DBService"

const _qrLink = (credID, password) =>
  window.location.href.split("#")[0] +
  "#/?a=" +
  btoa([credID, password, LAMP.Auth._auth.serverAddress].filter((x) => !!x).join(":"))

const theme = createMuiTheme({
  palette: {
    secondary: {
      main: "#333",
    },
  },
  overrides: {
    MuiTableCell: {
      root: {
        borderBottom: "#fff solid 1px",
        padding: 10,
      },
    },
    MuiToolbar: {
      root: {
        maxWidth: 1055,
        width: "80%",
        margin: "0 auto",
        background: "#fff !important",
      },
    },
    MuiInput: {
      root: {
        border: 0,
      },
      underline: {
        "&&&:before": {
          borderBottom: "none",
        },
        "&&:after": {
          borderBottom: "none",
        },
      },
    },
    MuiIcon: {
      root: { color: "rgba(0, 0, 0, 0.4)" },
    },
  },
})

const useStyles = makeStyles((theme: Theme) =>
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
    },
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
    studyCode: {
      margin: "4px 0",
      backgroundColor: "#ECF4FF",
      border: "2px solid #FFFFFF",
      color: "#000000",
      maxWidth: 250,
    },
    switchLabel: { color: "#4C66D6" },

    dataQuality: {
      margin: "4px 0",
      backgroundColor: "#E9F8E7",
      color: "#FFF",
    },
    tableOptions: {
      background: "#ECF4FF",
      padding: "10px 0",
    },
    btnOptions: {
      textTransform: "capitalize",
      color: "#4C66D6",
      margin: "0 45px 0 0",
      "& span": { cursor: "pointer" },
      "& svg": { width: 24, height: 24, fill: "#4C66D6" },
    },
    tableOuter: {
      width: "100vw",
      position: "relative",
      left: "50%",
      right: "50%",
      marginLeft: "-50.6vw",
      marginRight: "-50.6vw",
      marginBottom: 30,
      marginTop: -20,
      "& input": {
        width: 350,
        [theme.breakpoints.down("md")]: {
          width: 200,
        },
      },
      "& div.MuiToolbar-root": { maxWidth: 1232, width: "100%", margin: "0 auto" },
      "& h6": { fontSize: 30, fontWeight: 600 },
    },
    tagFiltered: {
      color: "#5784EE",
    },
    tagFilteredBg: {
      color: "#5784EE !important",
      "& path": { fill: "#5784EE !important", fillOpacity: 1 },
    },
    btnFilter: {
      color: "rgba(0, 0, 0, 0.4)",
      fontSize: 14,
      lineHeight: "38px",
      cursor: "pointer",
      textTransform: "capitalize",
      boxShadow: "none",
      background: "transparent",
      margin: "0 15px",
      paddingRight: 0,
      "& svg": { marginRight: 10 },
    },
    tableContainerWidth: {
      maxWidth: 1055,
      width: "80%",
    },
    disabledButton: {
      color: "#4C66D6 !important",
      opacity: 0.5,
    },
    customPopover: { backgroundColor: "rgba(0, 0, 0, 0.4)" },
    customPaper: {
      maxWidth: 380,
      marginTop: 75,
      marginLeft: 100,
      borderRadius: 10,
      padding: "10px 0",
      "& h6": { fontSize: 16 },
      "& li": {
        display: "inline-block",
        width: "100%",
        padding: "15px 30px",
        "&:hover": { backgroundColor: "#ECF4FF" },
      },
      "& *": { cursor: "pointer" },
    },
    popexpand: {
      backgroundColor: "#fff",
      color: "#618EF7",
      zIndex: 11111,
      "& path": { fill: "#618EF7" },
      "&:hover": { backgroundColor: "#f3f3f3" },
    },
    deleteBtn: { background: "#7599FF", color: "#fff", "&:hover": { background: "#5680f9" } },
    backdrop: {
      zIndex: 111111,
      color: "#fff",
    },
    dataGreen: { backgroundColor: "#e0ffe1 !important", color: "#4caf50" },
    dataYellow: { backgroundColor: "#fff8bc !important", color: "#a99700" },
    dataRed: { backgroundColor: "#ffcfcc !important", color: "#f44336" },
    dataGrey: { backgroundColor: "#d4d4d4 !important", color: "#424242" },
    closeButton: {
      position: "absolute",
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
    activityContent: {
      padding: "25px 25px 0",
    },

    manageStudypop: {
      padding: "25px 25px 30px 35px",
    },
    studyList: {
      borderBottom: "#e8e8e8 solid 1px",
    },
    errorMsg: { color: "#FF0000", fontSize: 12 },
    studyOption: { width: "100%" },
    addNewDialog: {
      maxWidth: 350,
      [theme.breakpoints.up("sm")]: {
        maxWidth: "auto",
        minWidth: 400,
      },
    },
    manageStudyDialog: { maxWidth: 700 },
    manageStudyBtn: {
      marginRight: 15,
      background: "#7599FF",
      color: "#fff",
      boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)",
      "&:hover": { background: "#5680f9" },
    },
    studyName: { maxWidth: 200, minWidth: 200, alignItems: "center", display: "flex" },
  })
)

export default function AddUser({
  researcher,
  studies,
  setParticipants,
  handleNewStudy,
  closePopUp,
  ...props
}: {
  researcher: any
  studies: any
  setParticipants?: Function
  handleNewStudy: Function
  closePopUp: Function
} & DialogProps) {
  const classes = useStyles()
  const [selectedStudy, setSelectedStudy] = useState("")
  const [showErrorMsg, setShowErrorMsg] = useState(false)
  const [studyBtnClicked, setStudyBtnClicked] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const [addUser, setAddUser] = useState(false)

  const validate = () => {
    return !(
      typeof selectedStudy === "undefined" ||
      (typeof selectedStudy !== "undefined" && selectedStudy?.trim() === "")
    )
  }

  const handleChangeStudy = (event) => {
    setShowErrorMsg(false)
    setSelectedStudy(event.target.value)
  }

  let addParticipant = async () => {
    if (selectedStudy === "") {
      setShowErrorMsg(true)
      return false
    } else {
      setStudyBtnClicked(true)
      let newCount = 1
      let ids = []
      for (let i = 0; i < newCount; i++) {
        let idData = ((await LAMP.Participant.create(selectedStudy, { study_code: "001" } as any)) as any).data
        let id = typeof idData === "object" ? idData.id : idData
        let newParticipant = []
        if (typeof idData === "object") {
          newParticipant = idData
        } else {
          newParticipant["id"] = idData
        }
        if (!!((await LAMP.Credential.create(id, `${id}@lamp.com`, id, "Temporary Login")) as any).error) {
          enqueueSnackbar(t("Could not create credential for id.", { id: id }), { variant: "error" })
        } else {
          newParticipant["study_id"] = selectedStudy
          newParticipant["study_name"] = studies.filter((study) => study.id === selectedStudy)[0]?.name
          Service.addData("participants", [newParticipant])
          Service.updateCount("studies", selectedStudy, "participant_count")
          Service.getData("studies", selectedStudy).then((studiesObject) => {
            handleNewStudy(studiesObject)
          })
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
        }
        ids = [...ids, id]
      }
      setParticipants()
    }
    setSelectedStudy("")
    closePopUp(3)
    props.onClose as any
  }
  return (
    <Dialog
      {...props}
      onEnter={() => {
        setSelectedStudy("")
      }}
      scroll="paper"
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
      classes={{ paper: classes.addNewDialog }}
    >
      <DialogTitle id="alert-dialog-slide-title">
        <Typography variant="h6">{t("Create a new user.")}</Typography>
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={props.onClose as any}
          disabled={!!studyBtnClicked ? true : false}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers={false} classes={{ root: classes.activityContent }}>
        <Box mt={2} mb={3}>
          <Typography variant="body2">{t("Choose the Study you want to save this participant.")}</Typography>
        </Box>
        <TextField
          error={!validate()}
          select
          autoFocus
          fullWidth
          variant="outlined"
          label={t("Study")}
          value={selectedStudy}
          onChange={handleChangeStudy}
          helperText={!validate() ? t("Please select the Study") : ""}
        >
          {studies.map((study) => (
            <MenuItem key={study.id} value={study.id}>
              {study.name}
            </MenuItem>
          ))}
        </TextField>
        {!!showErrorMsg ? (
          <Box mt={1}>
            <Typography className={classes.errorMsg}>{t("Select a Study to create a participant.")}</Typography>
          </Box>
        ) : (
          ""
        )}
      </DialogContent>
      <DialogActions>
        <Box textAlign="right" width={1} mt={3} mb={3} mx={3}>
          <Button
            color="primary"
            onClick={() => {
              closePopUp(3)
            }}
          >
            {t("Cancel")}
          </Button>
          <Button
            onClick={() => addParticipant()}
            color="primary"
            autoFocus
            //disabled={!!studyBtnClicked ? true : false}
            disabled={!validate()}
          >
            {t("Save")}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}
