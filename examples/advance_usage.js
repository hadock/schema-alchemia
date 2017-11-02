'use strict'
var alchemia = require('../index');

var schema1 = {
    "user_id": "user.id",
    "user_name": "user.name",
    "user_phone": {
        "target": "user.phone",
        "script": "() => { if(!value){ return ''; } return value.substring(0,2) + '-(' + value.substring(2,5) + ')-' + value.substring(5, 8) + '-' + value.substring(8,12); }"
    },
}

var schema2 = {
    "user.id": "user_id",
    "user.name": "user_name",
    "user.phone": {
        "target": "user_phone",
        "script": "() => { return value.replace( new RegExp('[^+0-9,]+','g'), '');}"
    }
}

var data = [
    {
        "user_id": 10,
        "user_name": "John Doe",
        "user_phone": "+14151234567"
    },
    {
        "user_id": 11,
        "user_name": "Jenny Smith",
        "user_phone": "+14151234321"
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

schema_transformation.set_source_schema('schema_name_2', result_1);
schema_transformation.set_target_schema('schema_name_1');

let result_2 = schema_transformation.transform();
console.log(JSON.stringify(result_2,null,2));

