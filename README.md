# node-red-contrib-ds18b20-sensor
This is a [Node Red](http://nodered.org/) node to manage connection to DS18B20 sensors on a Raspberry Pi. For each sensor found, it returns a msg object where the topic is set to the sensor ID and the payload is set to the temperature. If a device ID is passed into the node as the topic, this is used to return a single reading for the specified sensor.

Note that this does not use the owserver/owsfs services since I have found that these are unreliable.

The node is added to the Raspberry Pi section.
