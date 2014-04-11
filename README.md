filter-maker
============

* Generate where clauses and other filters for SQL queries.
* Current supports MSSQL
* Uses parameterized queries

## Example

```javascript
var FilterMaker = require('filter-maker')

var sql_template = [
  'select column from table',
  'where column is not null',
  '{{dateFilter}}',
  '{{countFilter}}'
].join()

var defaults = {}
var config = {
    name: 'date',
    filterName: 'dateFilter',
    type: TYPES.VarChar,
    clause: 'and create_datedate >= {{parameter}}'
  },
  {
    name: 'count',
    filterName: 'countFilter',
    type: TYPES.Int,
    clause: 'and product_count < {{parameter}}'
  }
}

var filters = new FilterMaker(defaults, config)

var query_info = filters.addFilters(sql_template, {
  'date': '2014-04-11',
  'count': 15
})

query_info.statement // sql statement
query_info.parameters // query parameters
```