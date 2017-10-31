# Schema-Alchemia
This is a NPM module to translate datasets based on schema models, the module is also able to run scripts defined on the model to make data transformation and map reduce.

###Features

- Data transformation useful to migrate between different DBs
- Map-reduce capabilities
- Data base agnostic
- API responses transformation

# README.md

**Examples of usage**
#####Install
<pre>npm install --save schema_alchemia</pre>

#####Basic usage (Single document transformation)
<pre>
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

</pre>

|user_id | user_name | user_phone
|:--------:|:-----------:|:-----------:|
| 10 | Jhon Doe | +1415123456 |

<pre>
var data = {
    "user_id": 10,
    "user_name": "John Doe",
    "user_phone": "+1415123456"
}

var schema_transformation = new alchemia({
    schema_name_1: schema1, 
    schema_name_2: schema2
});

schema_transformation.set_source_schema('schema_name_1', data);
schema_transformation.set_target_schema('schema_name_2');

var result = schema_transformation.transform();
</pre>

######The result will be something like:

```
{
	user: { 
		id: 10, 
		name: 'John Doe', 
		phone: '+1415123456' 
	}
}
```

#####Basic usage (Multiple document transformation)

|user_id | user_name | user_phone
|:--------:|:-----------:|:-----------:|
| 10 | Jhon Doe | +1415123456 |
| 11 | Jenny Smith | +1415187456 |

<pre>
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
</pre>

######The result will be something like:

```
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


