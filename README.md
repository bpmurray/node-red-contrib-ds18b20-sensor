# node-red-contrib-ds18b20-sensor
This is a [Node Red](http://nodered.org/) node to manage connection to DS18B20 sensors on a Raspberry Pi. For each sensor found, it returns the msg object where the *topic* is set to the sensor ID and the *payload* is set to the temperature. If the node's topic is set to a device ID, or a device ID is passed into the node as **msg.topic**, this is used to return a single reading for the specified sensor. If the *Array* checkbox is checked or **msg.array** is set to true, the value(s) are returned as an array in **msg.payload**. The current timestamp is always set as **msg.timestamp**.

A simple flow is to click on an *input node* to inject an empty message to the *sensor node* and capture the output in a *debug node*:

![Node-RED flow](https://github.com/bpmurray/node-red-contrib-ds18b20-sensor/blob/master/flow1.jpg?raw=true)

Clicking on the *input node* causes the values from all available temperature sensors to be returned as a series of messages:

![Message list](https://github.com/bpmurray/node-red-contrib-ds18b20-sensor/blob/master/data1.jpg?raw=true)

If the *Array* checkbox is checked this will cause ther return of data as an array:

![Edit dialog](https://github.com/bpmurray/node-red-contrib-ds18b20-sensor/blob/master/dialog1.jpg?raw=true)

Now, if the *input node* is clicked again, this time the data are returned as an array:

![Message array](https://github.com/bpmurray/node-red-contrib-ds18b20-sensor/blob/master/data2.jpg?raw=true)


By default, this node targets DS18B20 sensors, but you can also use it to capture data from other similar sensors. This reads the list of all available sensors using the Dallas One-Wire Protocol, and retrieves the temperature from those sensors that provide a temperature value.

The node is added to the Raspberry Pi section.
