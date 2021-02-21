# pgRouting-Web-API  [![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/I1mran/pgRouting-Web-Direction-API/blob/master/LICENSE)

A complete solution of pgRouting direction Web API written in Node js (Javascript) Express

## Setup

- edit `src/config/config.js` file according to your postgres connection, pgRouting table name and express js settings.
 
- *if your pgrouting database table schema/name of columns is different, you have to change the query schema in `src/model/pgrouting.js`
 
## Install Modules

`npm install`


## Start Development Server

`npm start`



## API Request Example
 * http://localhost:3000
 * http://localhost:3000/route?start=3078473.56,8206254.21&end=2780495.14,8423917.64
 * http://localhost:3000/closest?lat=3078473.56&lng=8206254.21&buffer=3000000&limit=1
 * http://localhost:3000/distance?start=3078473.56,8206254.21&end=2780495.14,8423917.64

## My API Request Example
 * http://localhost:3000/api/v1
 * http://localhost:3000/api/v1/route?start=99.99537,6.81322&end=100.00850,6.81125
 * http://localhost:3000/api/v1/distance?start=99.99537,6.81322&end=100.00850,6.81125
 * http://localhost:3000/api/v1/closest?lat=100.00855&lng=6.81122&buffer=1000&limit=1
 * http://localhost:3000/api/v1/topo
 * http://35.240.xxx.xxx:3300/api/route/6.81322/99.99537/6.81125/100.00850
 
App is underdevelopment:
* Way Points
* Docker
* Handle other pgRouting capabilities.
