# node-red-contrib-ds18b20-sensor
This is a [Node Red](http://nodered.org/) node to manage connection to DS18B20 sensors on a Raspberry Pi. For each sensor found, it returns a msg object where the topic is set to the sensor ID and the payload is set to the temperature. If a device ID is passed into the node as the topic, this is used to return a single reading for the specified sensor.

By default, this node targets DS18B20 sensors, but you can also use it to 
capture data from other similar sensors. Simply set the msg.family to the
appropriate value to enable this.

The node is added to the Raspberry Pi section.
