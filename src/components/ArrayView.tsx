import React from "react"
import { Table, TableBody, TableHead, TableCell, TableRow, Box } from "@material-ui/core"
import { humanize } from "./Utils"

import ReactMarkdown from "react-markdown"
import emoji from "remark-emoji"
import gfm from "remark-gfm"
import { useTranslation } from "react-i18next"

export default function ArrayView({
  value,
  hiddenKeys,
  hasSpanningRowForIndex,
  spanningRowForIndex,
  ...props
}: {
  value: any[]
  hiddenKeys?: string[]
  hasSpanningRowForIndex?: (index: number) => boolean
  spanningRowForIndex?: (index: number) => any
}) {
  const { t } = useTranslation()
  const displayKeys = () => Object.keys(value[0] || {}).filter((x) => !(hiddenKeys || []).includes(x))
  return (
    <div style={{ overflowX: "auto" }}>
      <Table>
        <TableHead>
          <TableRow>
            {displayKeys().map((key) => (
              <TableCell key={key} title={humanize(key)}>
                {humanize(key)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {value.map((row, index) => (
            <React.Fragment>
              <TableRow hover key={index}>
                {displayKeys().map((key) =>
                  Array.isArray(row[key]) ? (
                    <ArrayView value={row[key]} />
                  ) : !!row[key] && typeof row[key] === "object" ? (
                    <ArrayView value={[row[key]]} />
                  ) : (
                    <TableCell key={row[key]}>
                      {typeof row[key] === "string" ? (
                        <ReactMarkdown source={t(row[key])} escapeHtml={false} plugins={[gfm, emoji]} />
                      ) : (
                        row[key]
                      )}
                    </TableCell>
                  )
                )}
              </TableRow>
              {hasSpanningRowForIndex?.(index) && (
                <TableRow key={`${index}-optional`}>
                  <TableCell colSpan={displayKeys().length}>{spanningRowForIndex?.(row.item)}</TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
