
// Core Imports
import React, { useState, useEffect } from 'react'
import Box from '@material-ui/core/Box'
import MaterialTable from 'material-table'

// Local Imports
import LAMP from '../lamp'
import { ResponsivePaper } from '../components/Utils'

export default function Root({ ...props }) {
    const [researchers, setResearchers] = useState([])
    useEffect(() => {
        (async function() {
            setResearchers(await LAMP.Researcher.all())
        })()
    }, [])

	return (
        <ResponsivePaper elevation={4}>
            <MaterialTable 
                title="Researchers"
                data={researchers} 
                columns={[
                    { title: 'Name', field: 'name' }, 
                    { title: 'Email', field: 'email' }
                ]}
                onRowClick={(event, rowData, togglePanel) => 
                    props.history.push(`/researcher/${researchers[rowData.tableData.id].id}`)}
                editable={{
                    isEditable: rowData => rowData.email !== "Superadmin@Lamp.com",
                    isDeletable: rowData => rowData.email !== "Superadmin@Lamp.com",
                    onRowAdd: async (newData) => {
                        console.dir(await LAMP.Researcher.create(newData))
                        setResearchers(await LAMP.Researcher.all())
                    },
                    onRowUpdate: async (newData, oldData) => {
                        console.dir(await LAMP.Researcher.update(oldData.id, newData))
                        setResearchers(await LAMP.Researcher.all())
                    },
                    onRowDelete: async (oldData) => {
                        console.dir(await LAMP.Researcher.delete(oldData.id))
                        setResearchers(await LAMP.Researcher.all())
                    }
                }}
                localization={{
                    body: {
                        emptyDataSourceMessage: 'No Researchers. Add Researchers by clicking the [+] button above.',
                        editRow: { deleteText: 'Are you sure you want to delete this Researcher?' }
                    }
                }}
                options={{
                    actionsColumnIndex: -1,
                    pageSize: 10,
                    pageSizeOptions: [10, 25, 50, 100]
                }}
                components={{ Container: props => <Box {...props} /> }}
            />
        </ResponsivePaper>
    )
}
