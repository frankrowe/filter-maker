var mustache = require('mustache')
  , TYPES = require('tedious').TYPES
  , _ = require('underscore')

function FilterMaker(defaults, config) {
  this.defaults = defaults || {}
  this.config = config || {}
  this.template = {}
  this.parameters = []
}

FilterMaker.prototype.reset = function(){
  this.template = {}
  this.parameters = []
}

FilterMaker.prototype.makeParameter = function(filter_config, filter, idx){
  var name = filter_config.name
  if(idx) name += idx
  var parameterproperties = {
    name: name,
    type: filter_config.type,
    value: filter
  }
  this.parameters.push(parameterproperties)
  var template_parameter = '@' + parameterproperties.name
  return template_parameter
}

FilterMaker.prototype.addFilters = function(statement, filters){
  var self = this
  this.reset()
  for(var name in filters) {
    var filter = filters[name]
    var filter_configs = _.where(this.config, {name: name})
    if(filter_configs.length){
      filter_configs.forEach(function(filter_config){
        var template_parameters = []
        if(filter_config.array){
          var values = filter.split(',')
          values.forEach(function(value, idx){
            template_parameters.push(self.makeParameter(filter_config, value, idx))
          })
        } else {
          template_parameters.push(self.makeParameter(filter_config, filter))
        }
        var clause = mustache.render(filter_config.clause, {
          parameter: template_parameters.join()
        })
        self.template[filter_config.filterName] = clause
        if(filter_config.select){
          self.template.select = filter_config.select
        } else {
          if(self.defaults.select) {
            self.template.select = self.defaults.select
          }
        }
      })
    }
  }
  if(!Object.keys(filters).length){
    self.template = self.defaults
  }
  statement = mustache.render(statement, this.template)
  return {
    statement: statement,
    parameters: this.parameters
  }
}

module.exports = FilterMaker