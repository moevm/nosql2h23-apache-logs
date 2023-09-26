from influxdb import InfluxDBClient


client = InfluxDBClient(host="localhost", port=8086, username="user", password="pass")
client.switch_database("test_db")
print(client.get_list_database())

json_body = [
    {
        "measurement": "cpu_load_short",
        "tags": {
            "host": "server01",
            "region": "us-west"
        },
        "time": "2009-11-10T23:00:00Z",
        "fields": {
            "value": 0.64
        }
    }
]

client.write_points(json_body)

result = client.query('select value from cpu_load_short;')
 
print("Result: {0}".format(result))
