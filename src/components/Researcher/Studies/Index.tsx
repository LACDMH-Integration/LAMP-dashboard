import React, { useState, useEffect } from "react"
import { Box, Icon, Grid, makeStyles, Theme, createStyles, Fab } from "@material-ui/core"
import { useSnackbar } from "notistack"
import Header from "./Header"
import { useTranslation } from "react-i18next"
import { Service } from "../../DBService/DBService"
import Pagination from "../../PaginatedElement"
import StudyItem from "./StudyItem"
import useInterval from "../../useInterval"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
      [theme.breakpoints.down("sm")]: {
        marginBottom: 80,
      },
    },
    backdrop: {
      zIndex: 111111,
      color: "#fff",
    },
    studyMain: { background: "#F8F8F8", borderRadius: 4 },
    norecords: {
      "& span": { marginRight: 5 },
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

export default function StudiesList({ title, researcher, onStudySelect, ...props }) {
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const { t } = useTranslation()
  const [search, setSearch] = useState(null)
  const [paginatedStudies, setPaginatedStudies] = useState([])
  const [rowCount, setRowCount] = useState(40)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [allStudies, setAllStudies] = useState(null)
  const [studies, setStudies] = useState(null)

  useInterval(
    () => {
      searchFilterStudies()
    },
    allStudies !== null && (allStudies || []).length > 0 ? null : 2000,
    true
  )

  const searchFilterStudies = async () => {
    Service.getAll("studies").then((studiesList) => {
      ;(studiesList || []).sort((a, b) => {
        return a.name > b.name ? 1 : a.name < b.name ? -1 : 0
      })
      setAllStudies(studiesList)
      let result = []
      if (!!search && search !== "") {
        result = (studiesList || []).filter((i) => i.name?.toLowerCase()?.includes(search?.toLowerCase()))
        setStudies(result)
      } else {
        result = studiesList || []
        setStudies(studiesList)
      }
      setPaginatedStudies(result.slice(0, rowCount))
    })
  }

  useEffect(() => {
    searchFilterStudies()
  }, [search])

  const handleSearchData = (val) => {
    setSearch(val)
  }

  const handleChangePage = (page: number, rowCount: number) => {
    setLoading(true)
    setRowCount(rowCount)
    setPage(page)
    setPaginatedStudies((studies || []).slice(page * rowCount, page * rowCount + rowCount))
    setLoading(false)
  }

  return (
    <React.Fragment>
      <Header
        studies={allStudies}
        researcher={researcher}
        searchData={handleSearchData}
        setStudies={searchFilterStudies}
      />
      <Box className={classes.tableContainer} py={4}>
        <Grid container spacing={3}>
          {allStudies !== null && allStudies.length > 0 ? (
            <Grid container spacing={3}>
              {paginatedStudies.map((study) => (
                <Grid item lg={6} xs={12} key={study.id}>
                  <StudyItem
                    study={study}
                    allStudies={allStudies}
                    onStudySelect={() => onStudySelect(study, researcher.id)}
                    setStudies={searchFilterStudies}
                  />
                </Grid>
              ))}
              <Pagination
                data={allStudies}
                updatePage={handleChangePage}
                defaultCount={20}
                rowPerPage={[20, 40, 60, 80]}
              />
            </Grid>
          ) : (
            <Grid item lg={6} xs={12}>
              <Box display="flex" alignItems="center" className={classes.norecords}>
                <Icon>info</Icon>
                {t("No Records Found")}
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </React.Fragment>
  )
}
