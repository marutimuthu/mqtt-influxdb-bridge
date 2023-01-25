const mqtt = require("mqtt");
const consola = require("consola");
const Influx = require("influx");
require('dotenv').config()

const influxOptions = {
  host: process.env.INFLUX_HOST,
  port: process.env.INFLUX_PORT || 8086,
  username: process.env.INFLUX_USERNAME,
  password: process.env.INFLUX_PASSWORD,
  database: process.env.INFLUX_DB_NAME,
};

const mqttOptions = {
  // clientId: "data_db",
  clean: true,
  // host: process.env.MQTT_HOST,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  // protocol: process.env.MQTT_PROTOCOL || "tls",
};

const influx = new Influx.InfluxDB({
  ...influxOptions,
  schema: [
    {
      measurement: "parameter",
      fields: {
        value: Influx.FieldType.FLOAT,
      },
      tags: ["topic"],
    },
  ],
});

const processMessage = (topic, message) => {

  const messageString = message.toString();
  let parsedMessage = JSON.parse(messageString);

  const measurement = parsedMessage.measurement
  // consola.log(measurement)
  delete parsedMessage.measurement;
  // consola.log(parsedMessage)

  influx.writePoints(
    [{
      measurement: measurement,
      // tags: { host: 'box1.example.com' },
      fields: parsedMessage,
      // timestamp: getLastRecordedTime(),
    }],
    {
      // database: 'my_db',
      // retentionPolicy: '30d',
      precision: 's'
    }
  )
    .catch((err) => {
      consola.error(`Error saving data to InfluxDB! ${err.stack}`);
    })
};

function replace(myObj) {
  Object.keys(myObj).forEach(function (key) {
    typeof myObj[key] == 'object' ? replace(myObj[key]) : myObj[key] = Number(myObj[key]);
  });
}

const processMessage_CNC = (topic, message) => {
  if (message) {

    const messageString = message.toString();
    let parsedMessage = JSON.parse(messageString);

    // consola.log(parsedMessage)
    const measurement = parsedMessage.device
    const ts = parsedMessage.ts
    // consola.log(measurement)
    delete parsedMessage.device;
    // consola.log(parsedMessage)
    let fields = parsedMessage.data
    replace(fields)
    consola.log(fields)

    influx.writePoints(
      [{
        timestamp: ts,
        measurement: measurement,
        // tags: { host: 'box1.example.com' },
        fields: fields,
      }],
      {
        // database: 'my_db',
        // retentionPolicy: '30d',
        precision: 's'
      }
    )
      .catch((err) => {
        consola.error(`Error saving data to InfluxDB! ${err.stack}`);
      })
  }
};

// const processMessage = (topic, message) => {
//   const data = [];

//   Object.keys(message).forEach((measurement) => {
//     console.log(measurement)
//     const value = message[measurement];
//     console.log(value)
//     data.push({
//       measurement,
//       tags: { topic },
//       fields: { value },
//     });
//   });

//   return data;
// };

const topics = process.env.MQTT_TOPICS.split(",");

if (!topics.length) {
  consola.error("No topics to subscribe to");
}

const client = mqtt.connect(process.env.MQTT_HOST, mqttOptions);

client.subscribe(topics);

client.on("connect", () => {
  consola.success("Connected to MQTT broker");
});

client.on("offline", () => {
  consola.warn("MQTT broker connection failed");
  // process.exit(1);
});

client.on("error", (error) => {
  consola.error("MQTT Client Error:", error);
  // process.exit(1);
});

// { "measurement":"mac_id", "temperature": 21.1,"humidity": 37, "ph": 10, "ec": 54, "tds": 41, "water_pump_status": 0, "nutrition_pump_status": 0, "ph_down_pump_status": 0, "light_status": 0, "light_rgb": "#333333", "light_intensity": 80 }
client.on("message", (topic, message) => {
  consola.log("-[ message received: " + message + " at topic " + topic);

  processMessage_CNC(topic, message)
});
