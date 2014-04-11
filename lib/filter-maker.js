var mustache = require('mustache')
  , TYPES = require('tedious').TYPES
  , _ = require('underscore')

function FilterMaker(defaults, config) {
  this.defaults = defaults || {}
  this.config = config || {}
}

FilterMaker.prototype.addFilters = function(statement, filters){
  var self = this
  var template = {}
    , parameters = []
  for(var name in filters) {
    var filter = filters[name]
    var filter_configs = _.where(this.config, {name: name})
    var clause = ''
    if(filter_configs.length){
      filter_configs.forEach(function(filter_config){
        if(filter_config.array){
          var values = filter.split(',')
          var template_parameters = []
          values.forEach(function(value, idx){
            var parameterproperties = {
              name: filter_config.name + idx,
              value: value,
              type: filter_config.type
            }
            parameters.push(parameterproperties)
            template_parameters.push('@' + parameterproperties.name)
          })
          clause = mustache.render(filter_config.clause, {
            parameter: template_parameters.join()
          })
        } else {
          var parameterproperties = {
            name: filter_config.name,
            type: filter_config.type,
            value: filter
          }
          parameters.push(parameterproperties)
          var template_parameter = '@' + parameterproperties.name
          clause = mustache.render(filter_config.clause, {
            parameter: template_parameter
          })
        }
        if(filter_config.select){
          template.select = filter_config.select
        } else {
          if(self.defaults.select) {
            template.select = self.defaults.select
          }
        }
        template[filter_config.filterName] = clause
      })
    }
  }
  statement = mustache.render(statement, template)
  return {
    statement: statement,
    parameters: parameters
  }
}

module.exports = FilterMaker