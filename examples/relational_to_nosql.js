'use strict'
var alchemia = require('../index');

//simple transformation
var schema1 = {
    "user_id": "user.id",
    "user_name": "user.name",
    "user_phone": "user.phone",
    "user_address": "user.address"
}

var schema2 = {
    "user.id": "user_id",
    "user.name": "user_name",
    "user.phone": "user_phone"
}


//This is the data in schema1 structure
var data = {
    "user_id": 10,
    "user_name": "John Doe",
    "user_phone": "+1415123456"
}


var schema_transformation = new alchemia({schema_name_1: schema1, schema_name_2: schema2});
schema_transformation.set_source_schema('schema_name_1', data);
schema_transformation.set_target_schema('schema_name_2');

var result = schema_transformation.transform();

//result will be:
// { user: { id: 10, name: 'John Doe', phone: '+1415123456' } }

console.log(result);

