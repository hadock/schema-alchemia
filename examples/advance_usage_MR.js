'use strict'
var alchemia = require('../index');

var schema1 = {
    "group_by": "user_id",
    "model": {
        "user_id": "user.id",
        "user_name": "user.name",
        "user_phone": {
            "target": "user.phone",
            "script": "() => { if(!Array.isArray(obj.user.phone)){ return [{type: data_source.phone_type, number: value}];} obj.user.phone.push({type: data_source.phone_type, number: value}) }"
        }
    }
}

var schema2 = {}

var data = [
    {
        "user_id": 10,
        "user_name": "John Doe",
        "user_phone": "+14151234567",
        "phone_type": "celphone"
    },
    {
        "user_id": 10,
        "user_name": "Jhon Doe",
        "user_phone": "+14153214098",
        "phone_type": "fax"
    },
    {
        "user_id": 11,
        "user_name": "Jenny Smith",
        "user_phone": "+14151234321",
        "phone_type": "celphone"
    }
]

var schema_transformation = new alchemia({
    schema_name_1: schema1, 
    schema_name_2: schema2
});

schema_transformation.set_source_schema('schema_name_1', data);
schema_transformation.set_target_schema('schema_name_2');

let result_1 = schema_transformation.transform();

console.log(JSON.stringify(result_1,null,2));