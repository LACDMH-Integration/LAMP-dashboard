import { Service } from "../DBService/DBService"
import demo_db from "../../demo_db.json"
import LAMP from "lamp-core"

export const fetchResult = async (authString, id, type, modal) => {
  const baseUrl = "https://" + (!!LAMP.Auth._auth.serverAddress ? LAMP.Auth._auth.serverAddress : "api.lamp.digital")
  let result = await (
    await fetch(`${baseUrl}/${modal}/${id}/_lookup/${type}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + authString,
      },
    })
  ).json()
  return result
}

export const fetchPostData = async (authString, id, type, modal, methodType, bodyData) => {
  const baseUrl = "https://" + (!!LAMP.Auth._auth.serverAddress ? LAMP.Auth._auth.serverAddress : "api.lamp.digital")
  let result = await (
    await fetch(`${baseUrl}/${modal}/${id}/${type}`, {
      method: methodType,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + authString,
      },
      body: JSON.stringify(bodyData),
    })
  ).json()
  return result
}

const saveStudies = (result) => {
  const studies = result.studies.map(({ id, name, participant_count }) => ({ id, name, participant_count }))
  Service.addData("studies", studies)
}

export const saveStudyData = (result, type) => {
  Service.update("studies", result, type === "activities" ? "activity_count" : "sensor_count", "study_id")
  Service.addData(type, result[type])
}

const saveSettings = (newVal, key) => {
  Service.update("participants", newVal, key, "id")
}

export const saveDemoData = () => {
  Service.deleteDB()
  Service.addData("participants", demo_db.Participant)
  Service.addData("studies", demo_db.Study)
  Service.addData("activities", demo_db.Activity)
  Service.addData("sensors", demo_db.Sensor)
  Service.updateValues("activities", { activities: [{ study_id: "study1", study_name: "Demo" }] }, [
    "study_id",
    "study_name",
  ])
  Service.updateValues("sensors", { sensors: [{ study_id: "study1", study_name: "Demo" }] }, ["study_id", "study_name"])
  Service.updateValues(
    "studies",
    {
      studies: [{ participant_count: 1, sensor_count: demo_db.Sensor.length, activity_count: demo_db.Activity.length }],
    },
    ["sensor_count", "activity_count", "participant_count"]
  )
}

export const saveData = (authString, studyId) => {
  Service.deleteStudyDB()
  ;(async () => {
    await Service.getDataByKey("studies", [studyId], "id").then((data) => {
      let studyName = data[0]?.name ?? ""

      LAMP.Participant.allByStudy(studyId).then((participants) => {
        Service.addData("participants", participants)
        Service.updateValues("participants", { participants: [{ study_id: studyId, study_name: studyName }] }, [
          "study_id",
          "study_name",
        ])
        Service.getAll("researcher").then((data) => {
          let researcherNotification = !!data ? data[0]?.notification ?? false : false
          if (researcherNotification) {
            fetchResult(authString, studyId, "participant/mode/3", "study").then((settings) => {
              saveSettings(settings, "name")
              saveSettings(settings, "unity_settings")
            })
          } else {
            fetchResult(authString, studyId, "participant/mode/4", "study").then((settings) => {
              saveSettings(settings, "name")
            })
          }
          fetchResult(authString, studyId, "participant/mode/1", "study").then((sensors) => {
            saveSettings(sensors, "accelerometer")
            saveSettings(sensors, "analytics")
            saveSettings(sensors, "gps")
            fetchResult(authString, studyId, "participant/mode/2", "study").then((events) => {
              saveSettings(events, "active")
            })
          })
        })
      })
      LAMP.Activity.allByStudy(studyId).then((activities) => {
        Service.addData("activities", activities)
        Service.updateValues("activities", { activities: [{ study_id: studyId, study_name: studyName }] }, [
          "study_id",
          "study_name",
        ])
      })
      LAMP.Sensor.allByStudy(studyId).then((sensors) => {
        Service.addData("sensors", sensors)
        Service.updateValues("sensors", { sensors: [{ study_id: studyId, study_name: studyName }] }, [
          "study_id",
          "study_name",
        ])
      })
    })
  })()
}

export const saveDataToCache = (authString, id) => {
  Service.getAll("researcher").then((data) => {
    if ((data || []).length == 0 || ((data || []).length > 0 && (data || [])[0]?.id !== id)) {
      fetchResult(authString, id, "", "researcher").then((result) => {
        console.log(result)
        if (!!result.studies) {
          saveStudies(result)
          Service.addData("researcher", [{ id: id, notification: result.unityhealth_settings }])
        }
      })
    }
  })
}
