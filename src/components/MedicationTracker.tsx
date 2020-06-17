import React, { useState, useEffect } from "react"
import {
  Box,
  Container,
  Button,
  Icon,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Switch,
  Typography,
  Card,
  CardContent,
  Badge
} from "@material-ui/core"
import { DatePicker } from "@material-ui/pickers"
import { makeStyles, createStyles } from '@material-ui/core/styles';

import { IconButton, withStyles } from "@material-ui/core";
import '../css/calendar.css';

interface MedicationItem {
  medication_name: string
  start_date: any
  end_date: any
  dose: string
  reminder:boolean
}

const useStyles = makeStyles({
  highlight: {
    background: '#5abd5e',
    borderRadius:'5px',
  }
});
export default function MedicationTracker({ onComplete, ...props }) {
  const classes = useStyles();
  const [date, changeDate] = useState(new Date())
  const [open, setOpen] = React.useState(false)
  const [edit, setEdit] = React.useState(-1)
  const [open2, setOpen2] = React.useState(false)
  const [medications, setMedications] = useState<MedicationItem[]>([])
  const [highlightDates, setHighlightDates] = useState([]);
  
  useEffect(() => {
    
  }, [])

  const dateFormated = (date : any) => {
    const DATE_OPTIONS = {
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric' 
    };
   
    return new Date(date).toLocaleDateString('en-US', DATE_OPTIONS);      
  }
  let initialData = [];
  if(localStorage.getItem('mymedications') !== null) {
    const mymedications = JSON.parse(localStorage.getItem('mymedications'));
    initialData =  Object.keys(mymedications).map(function (key) {      
      return  dateFormated(mymedications[key].start_date); 
    }); 
  }

  const openDialog = () => {
    setOpen(true)
  }
  const openDialog2 = () => {
    const data = JSON.parse(JSON.stringify(medications));
    setOpen2(true)
  }
  const closeDialog = () => {
    setOpen(false)
  }
  const closeDialog2 = () => {
    setOpen2(false)
  }

  const saveMedication = (index:number) => {  
    const mymedications = [];
    console.log('index : ' + index, medications);
    if(localStorage.getItem('mymedications') !== null) {
      const r = JSON.parse(localStorage.getItem('mymedications'));
      Object.keys(r).forEach(key => {
        console.log(String(index) == key);
        if(String(index) == key) {  console.log(key);
          mymedications.push(medications);
        } else {
          mymedications.push(r[key]);
        }
      });
    }
    console.log(mymedications);
    if(edit === -1) {
      mymedications.push(medications);
    }
    localStorage.setItem('mymedications', JSON.stringify(mymedications));
    closeDialog();
  }
  const updateField = (e:any) => {
    const data = JSON.parse(JSON.stringify(medications));
    setMedications({
      ...medications,
      [e.target.id]: e.target.id === 'reminder' ? !data.reminder : e.target.value
    });   
    if(e.target.id === 'start_date') {
      setHighlightDates([...highlightDates, e.target.value]);
    } 
  };

  const editMedication = (key : any) => {
    const mymedications = JSON.parse(localStorage.getItem('mymedications'));    
    setMedications(mymedications[key]);     
    setEdit(key)
    setOpen(true)
  }

  const addMedication = () => {
    setEdit(-1)
    setOpen(true)
  }
  const getDateTimeformatted = (date : any) => {
    const DATE_OPTIONS = {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    const timeOptions = {
      hour12 : true,
      hour:  "2-digit",
      minute: "2-digit",
    };
    return new Date(date).toLocaleDateString('en-US', DATE_OPTIONS) + ' '+ new Date(date).toLocaleTimeString("en-US", timeOptions);      
  }

  const getMedications = () => { 
    let cards = [];
    if(localStorage.getItem('mymedications') !== null) {
      const mymedications = JSON.parse(localStorage.getItem('mymedications'));    
     
      Object.keys(mymedications).forEach(key => {
        if(typeof mymedications[key].start_date !== 'undefined') {
          const startDate = getDateTimeformatted(mymedications[key].start_date);
          const endDate = getDateTimeformatted(mymedications[key].end_date);
          cards.push(<Card style={{ margin: 16 }}>
                      <CardContent>
                        <Typography align="left">{mymedications[key].medication_name} {mymedications[key].dose}</Typography>
                        <Typography align="left" variant="body2"><Icon fontSize="small">access_time</Icon>
                        {startDate + ' to ' + endDate} </Typography>
                        <Button size="small" onClick={() => editMedication(key)} startIcon={<Icon>edit</Icon>}>
                          Edit
                        </Button>
                      </CardContent>
                    </Card>);
        }
      
  
    });  }
    return cards;
  }
  const [selectedDays, setSelectedDays] = useState([1, 2, 15])
  const [selectedDate, handleDateChange] = useState(new Date())
  const [selectedDateEnd, handleDateChangeEnd] = useState(new Date())
  const [medication, setmedication] = useState(null)

 const currentMedications = edit >= 0 ? JSON.parse(JSON.stringify(medications)) : []; 
  return (
    <Container maxWidth="sm">
      <Box className="medication-calendar" display="flex" border={2} borderColor="grey.300" borderRadius={8} bgcolor="#fff" p={5} my={5}>
        <DatePicker
       
          autoOk
          orientation="landscape"
          variant="static"
          openTo="date"
          
          value={date}
          onChange={changeDate}
          renderDay={(date, selectedDate, isInCurrentMonth, dayComponent) => {
            const isSelected = isInCurrentMonth && initialData.includes(dateFormated(date))
            const view = isSelected ? <div className={classes.highlight}>
            <IconButton >
              <span> {dayComponent} </span>
            </IconButton>
          </div> :  
              <span> {dayComponent} </span>
           ;
            return (
              view
            )         
        }}
        />
      </Box>
      <Button style={{ margin: 8 }} variant="contained" startIcon={<Icon>star_border</Icon>} onClick={openDialog2}>
        My Medications
      </Button>
      <Dialog fullWidth={true} open={open2} onClose={closeDialog2}>
        <DialogTitle> My Medications </DialogTitle>
        <DialogContent>
          {getMedications()}          
          <DialogActions>
            <Button onClick={closeDialog2} startIcon={<Icon>close</Icon>}>
              Close
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
      <Button style={{ margin: 8 }} variant="contained" startIcon={<Icon>add</Icon>} onClick={() => addMedication()}>
        Add Medication
      </Button>
      <Dialog fullWidth={true} open={open} onClose={closeDialog}>
        <Container>
          <DialogTitle>Add Medication </DialogTitle>
          <DialogContent> </DialogContent>
          <form>
          <TextField fullWidth={true} autoFocus margin="normal" variant="outlined" label="Medication Name" 
             onChange={updateField} name="medication_name" id="medication_name" value={currentMedications.medication_name ? currentMedications.medication_name: ''} />
          <div></div>
          <TextField autoFocus margin="normal" variant="outlined" label="Dose" name="dose" id="dose"  onChange={updateField} value={currentMedications.dose ? currentMedications.dose: ''}/>
          <Typography>Set reminder? </Typography>
          <Switch color="primary" id="reminder" name="reminder" onChange={updateField} checked={currentMedications.reminder ? currentMedications.reminder: ''}> </Switch>
          <div></div>
          <TextField
          onChange={updateField}
              id="start_date"
              label="Start date"
              placeholder="Start Date"
              type="datetime-local"
              defaultValue={currentMedications.start_date ? currentMedications.start_date: ''}
              InputLabelProps={{
                shrink: true,
              }}
            />          
          <div></div>
          <TextField
          onChange={updateField}
              id="end_date"
              label="End date"
              placeholder="End Date"
              type="datetime-local"
              defaultValue={currentMedications.end_date ? currentMedications.end_date: ''}
              InputLabelProps={{
                shrink: true,
              }}
            />        
          <DialogActions>
            <Button onClick={closeDialog} startIcon={<Icon>delete</Icon>}>
              Cancel
            </Button>
            <Button onClick={currentMedications.medication_name ? () => saveMedication(edit) : () => saveMedication(edit)} startIcon={<Icon>save</Icon>}>
              Save
            </Button>
          </DialogActions>
          </form>
        </Container>
      </Dialog>
    </Container>
  )
}
