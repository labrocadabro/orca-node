# ORCA (Operational Resource Computing and Automation)
ORCA is simple application that allows you to run tasks in the containerisation environments.

## ORCA Environments Variables

|      Name     |    Default    |    Type    | Description |
| ------------- | ------------- | ---------- | ----------- |
| ORCA_SERVER_IP | "0.0.0.0" | String | Server IP on which ORCA will be running |
| ORCA_SERVER_PORT | 3003 | Number | Orca will be running this port
| ORCA_SSL_ENABLE | false | Boolean | Set it `true` to run ORCA with https |
| ORCA_SSL_ROOT_CA | null | String | Root Certificate Authority, `ORCA_SSL_ENABLE` must be `true` 
| ORCA_SSL_KEY | null | String | Private Key, `ORCA_SSL_ENABLE` must be `true` 
| ORCA_SSL_CERT | null | String | Certificate, `ORCA_SSL_ENABLE` must be `true` 
| ORCA_PRIVATE_HOST |"host.container.internal"| String | Host, Using for communicate with ORCA from Pulse-Proxy
	



