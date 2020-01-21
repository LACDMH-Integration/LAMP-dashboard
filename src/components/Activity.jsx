
// Core Imports
import React, { useState } from 'react'
import { Box, Tabs, Tab } from '@material-ui/core'

// Local Imports
import ActivityScheduler from './ActivityScheduler'
import SurveyCreator from './SurveyCreator'
import { ResponsivePaper } from '../components/Utils'

export default function Activity({ activity, studyID, onSave, ...props }) {
    //const isGroup = ((activity || {}).spec) === 'lamp.group'
    const isSurvey = ((activity || {}).spec) === 'lamp.survey'
    const [currentTab, setCurrentTab] = useState(isSurvey ? 0 : 1)
	return (
        <ResponsivePaper elevation={4}>
            <Tabs
                value={currentTab}
                onChange={(event, newTab) => setCurrentTab(isSurvey ? newTab : 1)}
                indicatorColor="primary"
                textColor="primary"
                centered
            >
                <Tab label="Settings" />
                <Tab label="Schedules" />
            </Tabs>
            {currentTab === 0 && isSurvey && <Box m={4}><SurveyCreator value={activity} onSave={onSave} /></Box>}
            {currentTab === 1 && <ActivityScheduler activity={activity} />}
        </ResponsivePaper>
    )
}
