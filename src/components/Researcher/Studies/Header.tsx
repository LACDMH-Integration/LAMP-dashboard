import React, { useState } from "react"
import { Box, Popover, Fab, Typography, Icon, MenuItem, makeStyles, Theme, createStyles } from "@material-ui/core"
import { useTranslation } from "react-i18next"
import SearchBox from "../../SearchBox"
import AddButton from "./AddButton"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    header: {
      "& h5": {
        fontSize: "30px",
        fontWeight: "bold",
      },
    },
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
    addText: {
      [theme.breakpoints.down("sm")]: {
        display: "none",
      },
    },
  })
)

export default function Header({ studies, researcher, searchData, setStudies, ...props }) {
  const classes = useStyles()
  const { t } = useTranslation()

  return (
    <Box>
      <Box display="flex" className={classes.header}>
        <Box flexGrow={1} pt={1}>
          <Typography variant="h5">Studies</Typography>
        </Box>
        <Box>
          <SearchBox searchData={searchData} />
        </Box>
        <Box>
          <AddButton researcher={researcher} studies={studies} setStudies={setStudies} />
        </Box>
      </Box>
    </Box>
  )
}
