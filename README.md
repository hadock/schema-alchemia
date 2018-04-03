# Schema-Alchemia
This is a NPM module to translate datasets based on schema models, the module is also able to run scripts defined on the model to make data transformation and map reduce.

### Features

- Data transformation useful to migrate between different DBs
- Map-reduce capabilities
- Data base agnostic
- API responses transformation

# README.md

### Examples of usage
### Install
```sh
npm install --save schema_alchemia
```

### Basic usage (Single document transformation)
```javascript
'use strict'
var alchemia = require('schema_alchemia');

var schema1 = {
    "user_id": "user.id",
    "user_name": "user.name",
    "user_phone": "user.phone"
}

var schema2 = {
    "user.id": "user_id",
    "user.name": "user_name",
    "user.phone": "user_phone"
}
```

|user_id | user_name | user_phone
|:--------:|:-----------:|:-----------:|
| 10 | Jhon Doe | +1415123456 |

```javascript
var data = {
    "user_id": 10,
    "user_name": "John Doe",
    "user_phone": "+1415123456"
}

var schema_transformation = new alchemia({
    schema_name_1: schema1, 
    schema_name_2: schema2,
    ignore_null_source:true //it can be ignored, by default it is false
});

schema_transformation.set_source_schema('schema_name_1', data);
schema_transformation.set_target_schema('schema_name_2');

var result = schema_transformation.transform();
```

### The result will be something like:

```javascript
{
	user: { 
		id: 10, 
		name: 'John Doe', 
		phone: '+1415123456' 
	}
}
```

### Basic usage (Multiple document transformation)

|user_id | user_name | user_phone
|:--------:|:-----------:|:-----------:|
| 10 | Jhon Doe | +1415123456 |
| 11 | Jenny Smith | +1415187456 |

```javascript
var data = [
    {
        "user_id": 10,
        "user_name": "John Doe",
        "user_phone": "+1415123456"
    },
    {
        "user_id": 11,
        "user_name": "Jenny Smith",
        "user_phone": "+1415187456"
    }
]

var schema_transformation = new alchemia({
    schema_name_1: schema1, 
    schema_name_2: schema2
});

schema_transformation.set_source_schema('schema_name_1', data);
schema_transformation.set_target_schema('schema_name_2');

var result = schema_transformation.transform();
```

### The result will be something like:

```javascript
[
  {
    "user": {
      "id": 10,
      "name": "John Doe",
      "phone": "+1415123456"
    }
  },
  {
    "user": {
      "id": 11,
      "name": "Jenny Smith",
      "phone": "+1415187456"
    }
  }
]
```

### Advance usage (Multiple document transformation)

### Data transformation using scripts defined in the schema definition

|user_id | user_name | user_phone
|:--------:|:-----------:|:-----------:|
| 10 | Jhon Doe | +14151234567 |
| 11 | Jenny Smith | +14151234321 |

```javascript
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
```

### The result will be something like:

#### The phone number has been formated with a simple script in the definition

```javascript
[
  {
    "user": {
      "id": 10,
      "name": "John Doe",
      "phone": "+1-(415)-123-4567"
    }
  },
  {
    "user": {
      "id": 11,
      "name": "Jenny Smith",
      "phone": "+1-(415)-123-4321"
    }
  }
]
```

#### Now we can go backward using the same `result_1` and the `schema1` as the target schema

```javascript
schema_transformation.set_source_schema('schema_name_2', result_1);
schema_transformation.set_target_schema('schema_name_1');

let result_2 = schema_transformation.transform();
console.log(JSON.stringify(result_2,null,2));
```

#### The result will be the same as the initial data:

#### Take a look in the phone number, has been converted based in the script defined in the `schema2`
```javascript
[
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
```

#### Advance usage (Performing Map-Reduce based on scripts defined on the schema)

##### The schema definition changes a little bit but, it's a simple way to reduce duplicated data into a single document

| user_id | user_name | user_phone | phone_type |
|:--------:|:-----------:|:-----------:|:-----------:|
| 10 | Jhon Doe | +14151234567 | cellphone |
| 10 | Jhon Doe | +14153214098 | fax |
| 11 | Jenny Smith | +14151234321 | cellphone |

##### The source code for this example

```javascript
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
        "phone_type": "cellphone"
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
        "phone_type": "cellphone"
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

```

##### The result will be something like

```javascript
{
  "10": {
    "user": {
      "id": 10,
      "name": "Jhon Doe",
      "phone": [
        {
          "type": "cellphone",
          "number": "+14151234567"
        },
        {
          "type": "fax",
          "number": "+14153214098"
        }
      ]
    }
  },
  "11": {
    "user": {
      "id": 11,
      "name": "Jenny Smith",
      "phone": [
        {
          "type": "cellphone",
          "number": "+14151234321"
        }
      ]
    }
  }
}
```
