// Core Imports
import React, { useEffect, useState } from "react"
import { Box, Icon, IconButton, Tooltip, Typography, Divider, colors } from "@material-ui/core"
// Local Imports
import Sparkline from "./Sparkline"
import ArrayView from "./ArrayView"
import { useTranslation } from "react-i18next"
import { strategies } from "./PreventSelectedActivities"
import ReactMarkdown from "react-markdown"
import emoji from "remark-emoji"
import gfm from "remark-gfm"

export default function ActivityCard({
  activity,
  events,
  startDate,
  forceDefaultGrid,
  onEditAction,
  onCopyAction,
  onDeleteAction,
  ...props
}) {
  let freeText = (Array.isArray(activity.settings) ? activity.settings : [])
    .map((x) => x.type)
    .filter((x) => [null, "text", "paragraph"].includes(x))

  const [visibleSlice, setVisibleSlice] = useState<any>()
  const [helpAnchor, setHelpAnchor] = useState<Element>()
  const [showGrid, setShowGrid] = useState<boolean>(forceDefaultGrid || Boolean(freeText.length))
  const { t } = useTranslation()
  const selectedActivity = activity
  let each = Object.values(
    events
      .map((d) =>
        d.temporal_slices.map((t) => ({
          item: t.item,
          [new Date(d.timestamp).toLocaleString("en-US", Date.formatStyle("medium"))]:
            activity.spec === "lamp.survey" || activity.spec === "lamp.pop_the_bubbles"
              ? typeof t.value === "string"
                ? typeof t.value === "string" && ["Yes", "True"].includes(t.value.replace(/\"/g, ""))
                  ? 1
                  : typeof t.value === "string" && ["No", "False"].includes(t.value.replace(/\"/g, ""))
                  ? 0
                  : !isNaN(Number(t.value.replace(/\"/g, "")))
                  ? Number(t.value.replace(/\"/g, ""))
                  : t.value
                : t.value
              : !!t.type
              ? 1
              : 0,
        }))
      )
      .reduce((x, y) => x.concat(y), [])
      .groupBy("item")
  )
    .map((v: any) => Object.assign({}, ...v))
    .reduce((x, y) => x.concat(y), [])
  let eachData = []
  each = each.map((d, key) => {
    let keys = Object.keys(d)
    eachData[d["item"]] = []
    keys.map((k) => {
      if (k !== "item") {
        eachData[d["item"]].push({
          x: k,
          y: d[k],
          missing: [null, "NULL"].includes(d),
        })
      }
    })
  })
  return (
    <React.Fragment>
      <Box display="flex" justifyContent="space-between" alignContent="center" p={2}>
        {!Boolean(visibleSlice) && activity.spec !== "lamp.scratch_image" && activity.spec !== "lamp.breathe" ? (
          <Tooltip title={t("Switch Views")}>
            <IconButton onClick={(event) => setShowGrid(!showGrid)}>
              <Icon fontSize="small">dashboard</Icon>
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title={t("Go Back")}>
            <IconButton onClick={(event) => setVisibleSlice(undefined)}>
              <Icon fontSize="small">arrow_back</Icon>
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={Boolean(visibleSlice) ? activity.name : t(`Activity Type`)}>
          <Typography variant="h6" align="center" style={{ marginTop: 6, flexGrow: 1 }}>
            {!Boolean(visibleSlice) ? (
              <ReactMarkdown source={t(activity.name)} escapeHtml={false} plugins={[gfm, emoji]} />
            ) : (
              visibleSlice.x.toLocaleString("en-US", Date.formatStyle("medium"))
            )}
          </Typography>
        </Tooltip>
        <Box>
          {!Boolean(visibleSlice) && (
            <Tooltip title={t("Show App Screenshot")}>
              <IconButton onClick={(event) => setHelpAnchor(event.currentTarget)}>
                <Icon fontSize="small">help</Icon>
              </IconButton>
            </Tooltip>
          )}
          {Boolean(visibleSlice) && !!onDeleteAction && (
            <Tooltip title={t("Delete Entry")}>
              <IconButton onClick={(event) => onDeleteAction(visibleSlice)}>
                <Icon fontSize="small">delete</Icon>
              </IconButton>
            </Tooltip>
          )}
          {Boolean(visibleSlice) && !!onCopyAction && (
            <Tooltip title={t("Copy Entry")}>
              <IconButton onClick={(event) => onCopyAction(visibleSlice)}>
                <Icon fontSize="small">file_copy</Icon>
              </IconButton>
            </Tooltip>
          )}
          {Boolean(visibleSlice) && !!onEditAction && (
            <Tooltip title={t("Edit Entry")}>
              <IconButton onClick={(event) => onEditAction(visibleSlice)}>
                <Icon fontSize="small">edit</Icon>
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      <Divider />
      {Boolean(visibleSlice) ? (
        (visibleSlice.slice || []).length === 0 ? (
          <Typography variant="subtitle2" style={{ margin: 16 }}>
            {t("No detail view available.")}
          </Typography>
        ) : (
          <ArrayView
            hiddenKeys={["x"]}
            value={(visibleSlice.slice || []).map((x) => ({
              item: x.item,
              value:
                typeof x.value === "string" && !isNaN(Number(x.value.replace(/\"/g, "")))
                  ? Number(x.value.replace(/\"/g, ""))
                  : `${x.value}`.replace("NaN", "-").replace("null", "-").replace(/\"/g, ""),
              time_taken: `${(x.duration / 1000).toFixed(1)}s`.replace("NaN", "0.0"),
            }))}
          />
        )
      ) : showGrid &&
        activity.spec !== "lamp.scratch_image" &&
        activity.spec !== "lamp.tips" &&
        activity.spec !== "lamp.breathe" ? (
        <ArrayView
          hiddenKeys={["x"]}
          hasSpanningRowForIndex={
            (idx) =>
              true /* ['boolean', 'list'].includes(((Array.isArray(activity.settings) ? activity.settings : [])[idx] || {}).type) */
          }
          spanningRowForIndex={(idx) => (
            <Sparkline
              minWidth={48}
              minHeight={48}
              color={colors.blue[500]}
              data={eachData[idx]}
              onClick={(datum) => setVisibleSlice(datum)}
            />
          )}
          value={Object.values(
            events
              .map((d) =>
                d.temporal_slices.map((t) => ({
                  item: t.item,
                  [new Date(d.timestamp).toLocaleString("en-US", Date.formatStyle("medium"))]:
                    activity.spec === "lamp.survey" || activity.spec === "lamp.pop_the_bubbles"
                      ? typeof t.value === "string"
                        ? typeof t.value === "string" && ["Yes", "True"].includes(t.value.replace(/\"/g, ""))
                          ? 1
                          : typeof t.value === "string" && ["No", "False"].includes(t.value.replace(/\"/g, ""))
                          ? 0
                          : !isNaN(Number(t.value.replace(/\"/g, "")))
                          ? Number(t.value.replace(/\"/g, ""))
                          : t.value
                        : t.value
                      : !!t.type
                      ? 1
                      : 0,
                }))
              )
              .reduce((x, y) => x.concat(y), [])
              .groupBy("item")
          )
            .map((v: any) => Object.assign({}, ...v))
            .reduce((x, y) => x.concat(y), [])}
        />
      ) : (
        <Sparkline
          minWidth={250}
          minHeight={350}
          XAxisLabel={t("Time")}
          YAxisLabel={t("Score")}
          color={colors.blue[500]}
          startDate={startDate}
          data={events.map((d) => ({
            x: new Date(d.timestamp),
            y: strategies[activity.spec]
              ? strategies[activity.spec](
                  activity.spec === "lamp.survey" || activity.spec === "lamp.pop_the_bubbles"
                    ? d.temporal_slices
                    : activity.spec === "lamp.scratch_image" ||
                      activity.spec === "lamp.breathe" ||
                      activity.spec === "lamp.tips"
                    ? d
                    : d.static_data,
                  selectedActivity,
                  undefined
                )
              : 0,
            slice: d.temporal_slices,
            missing:
              activity.spec === "lamp.survey" || activity.spec === "lamp.pop_the_bubbles"
                ? d.temporal_slices.filter((z) => [null, "NULL"].includes(z.value)).length > 0
                : false,
          }))}
          onClick={(datum) =>
            activity.spec !== "lamp.scratch_image" && activity.spec !== "lamp.breathe" && activity.spec !== "lamp.tips"
              ? setVisibleSlice(datum)
              : setVisibleSlice(null)
          }
        />
      )}
    </React.Fragment>
  )
}
