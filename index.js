'use strict';

class Schema_Alchemia {

  constructor(schema_rules) {
    this.current_source;
    this.current_target;
    this.current_data;
    this.functions = [];

    if (Object.getOwnPropertyNames(schema_rules).length >= 1) {
      for (var prop in schema_rules) {
        if (typeof schema_rules[prop].group_by === 'undefined') {
          this[prop] = { is_source: false, is_target: false, group_by: false, schema: schema_rules[prop], data: {}, translated: {} };
        }
        else {
          this[prop] = { is_source: false, is_target: false, group_by: schema_rules[prop].group_by, schema: schema_rules[prop].model, data: {}, translated: {} };
        }
      }
    }
    else {
      throw { "msg": "At least 1 schema must be parsed to initialize this class, Example: { shema1:{}, schema2:{}, schemaN... }" }
    }
  }

  set_local_functions(function_name, funct) {
    this.functions[function_name] = funct;
    console.log("Hola Mundo")
  }

  //define el origen de los datos a ser manipulados
  set_source_schema(schema_name, data) {
    if (typeof this[schema_name] !== 'undefined') {
      this[schema_name].is_source = true;
      this.current_source = schema_name;
      if (data) {
        this[schema_name].data = data;
      }
    }
  }

  set_target_schema(schema_name) {
    if (typeof this[schema_name] !== 'undefined') {
      this[schema_name].is_target = true;
      this.current_target = schema_name;
    }
  }

  //guarda los datos obtenidos desde la base de datos
  set_data(data, schema_name) {
    schema_name = !schema_name ? this.current_schema : schema_name;

    if (typeof this[schema_name] !== 'undefined') {
      this[schema_name].data = data;
    }
    else {
      throw { "msg": "Schema not initialized" }
    }
  }

  transform() {
    if (this[this.current_source].group_by) {
      //console.log('Multiple documents -> group_by');
      //es un arreglo de datos con con el mismo schema
      for (let data_indx in this[this.current_source].data) {
        this.current_data = this[this.current_source].data[data_indx];
        //console.log(this.current_data);
        for (let prop in this[this.current_source].schema) {
          //read source
          let value = this.__read_write(this.current_data, prop);
          //write translation
          //console.log('targeting:', this[this.current_target]);
          if (typeof this[this.current_target].translated[this.current_data[this[this.current_source].group_by]] === 'undefined') {
            this[this.current_target].translated[this.current_data[this[this.current_source].group_by]] = {};
          }
          //console.log(this[this.current_target].translated[this.current_data[this[this.current_source].group_by]]);
          this.__read_write(this[this.current_target].translated[this.current_data[this[this.current_source].group_by]], this[this.current_source].schema[prop], value);
        }

      }
      return this[this.current_target].translated;
    }
    else if (Array.isArray(this[this.current_source].data)) {
      //console.log('Multiple documents -> no group_by');
      //es un arreglo de datos con con el mismo schema
      var doc = 0;
      for (let data_indx in this[this.current_source].data) {
        this.current_data = this[this.current_source].data[data_indx];
        //console.log(this.current_data);
        for (let prop in this[this.current_source].schema) {
          //read source
          let value = this.__read_write(this.current_data, prop);
          //write translation
          //console.log('targeting:', this[this.current_target]);
          if (!Array.isArray(this[this.current_target].translated)) {
            this[this.current_target].translated = [];
          }
          if (typeof this[this.current_target].translated[doc] === 'undefined') {
            this[this.current_target].translated[doc] = {};
          }
          //console.log(this[this.current_target].translated[this.current_data[this[this.current_source].group_by]]);
          this.__read_write(this[this.current_target].translated[doc], this[this.current_source].schema[prop], value);
        }
        doc++;
      }
      return this[this.current_target].translated;
    }
    else {
      //es solo un documento con el schema definido
      //console.log('Single document');
      this.current_data = this[this.current_source].data;
      for (var prop in this[this.current_source].schema) {
        //read source
        let value = this.__read_write(this[this.current_source].data, prop);

        //write translation
        //console.log('targeting:', this[this.current_target]);
        this.__read_write(this[this.current_target].translated, this[this.current_source].schema[prop], value);
      }
      return this[this.current_target].translated;
    }
  }

  __read_write(obj, field_addr, value) {
    if (typeof field_addr == 'string') {
      return this.__read_write(obj, field_addr.split('.'), value);
    }
    else if (!Array.isArray(field_addr) && field_addr.toString() === '[object Object]') {
      if (typeof field_addr.target == 'undefined') { throw { "msg": "Target not defined for this value: " + value } }
      if (typeof field_addr.script == 'undefined') { throw { "msg": "Script not defined for [" + field_addr.target + "]" } }
      var data_source = this.current_data;
      let script = eval(field_addr.script);
      var result = null;
      try {
        result = script(this.functions);
      }
      catch (e) {
        console.error('script_failed: target:', field_addr.target);
        console.error('script_failed: value:', value);
        console.error('script_failed: script:', field_addr.script);
        result = '';
        throw e;
      }
      this.__read_write(obj, field_addr.target, result);
    }
    else if (field_addr.length == 1 && value !== undefined) {
      //console.log(obj);
      obj[field_addr[0]] = value;
      return obj[field_addr[0]];
    }
    else if (field_addr.length == 0) {
      return obj;
    }
    else {
      if (obj == undefined && value == undefined) {
        console.log('field', field_addr[0]);
        console.log('obj', obj);
        console.log('value', value);
        return;
      }
      if (typeof obj[field_addr[0]] === 'undefined' && value !== undefined) {
        obj[field_addr[0]] = {};
      }
      return this.__read_write(obj[field_addr[0]], field_addr.slice(1), value);
    }
  }
}

module.exports = Schema_Alchemia;
