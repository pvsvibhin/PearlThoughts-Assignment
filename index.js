const express = require("express");
const path = require("path");
const checkDate = require("./CheckDayAndTime/date.js");
const checkTime = require("./CheckDayAndTime/time.js");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "doctors.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/doctors/", async (request, response) => {
  const getDoctorsQuery = `
    SELECT
      *
    FROM
      doctors_table
    ORDER BY
      doctor_id;`;
  const doctorsArray = await db.all(getDoctorsQuery);
  response.send(doctorsArray);
});

app.get("/appointments/", async (request, response) => {
  const getAppointmentsQuery = `
    SELECT
      *
    FROM
      appointments
    ORDER BY
      id;`;
  const appointmentsArray = await db.all(getAppointmentsQuery);
  response.send(appointmentsArray);
});

app.get("/doctors/:doctorId/", async (request, response) => {
  const { doctorId } = request.params;
  const getDoctorQuery = `
    SELECT
      *
    FROM
      doctors_table
    WHERE
      doctor_id = ${doctorId};`;
  const doctor = await db.get(getDoctorQuery);
  response.send(doctor);
});

app.get("/appointments/:appointmentId/", async (request, response) => {
  const { appointmentId } = request.params;
  const getAppointmentQuery = `
    SELECT
      *
    FROM
      appointments
    WHERE
      id = ${appointmentId};`;
  const appointment = await db.get(getAppointmentQuery);
  response.send(appointment);
});

app.get("/doctors/:doctorId/appointments/", async (request, response) => {
  const { doctorId } = request.params;
  const getDoctorAppointmentsQuery = `
    SELECT
      *
    FROM
      appointments
    WHERE
      doctor_id = ${doctorId};`;
  const doctorAppointments = await db.all(getDoctorAppointmentsQuery);
  response.send(doctorAppointments);
});

app.post("/appointments/", async (request, response) => {
  const appointmentDetails = request.body;
  const {
    patientName,
    patientAge,
    datetimeOfAppointment,
    doctorId,
  } = appointmentDetails;

  const dateStatus = checkDate(datetimeOfAppointment);
  const timeStatus = checkTime(datetimeOfAppointment);

  if (dateStatus === false && timeStatus === true) {
    const addAppointmentQuery = `
    INSERT INTO
      appointments (patient_name, patient_age, datetime_of_appointment, doctor_id)
    VALUES
      (
        '${patientName}',
         ${patientAge},
        '${datetimeOfAppointment}',
         ${doctorId}
      );`;

    const dbResponse = await db.run(addAppointmentQuery);
    const appointmentId = dbResponse.lastID;
    response.send({ appointmentId: appointmentId });
  } else if (dateStatus === true) {
    response.send("Doctors are on leave during Sundays");
  } else if (timeStatus === false) {
    response.send("Doctors are available only during evenings after 5PM.");
  }
});

app.delete("/appointments/:appointmentId/", async (request, response) => {
  const { appointmentId } = request.params;
  const deleteAppointmentsQuery = `
    DELETE FROM
      appointments
    WHERE
      id = ${appointmentId};`;
  await db.run(deleteAppointmentsQuery);
  response.send("Appointment Deleted Successfully");
});
