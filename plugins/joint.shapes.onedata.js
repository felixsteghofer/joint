/*! JointJS v0.9.0 - JavaScript diagramming library  2014-09-03 


This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*! JointJS v0.9.0 - JavaScript diagramming library  2014-07-29 


This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
/*! Fork of JointJS v0.9.0 - JavaScript diagramming library  2014-06-06 


This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
//      JointJS library.
//      (c) 2011-2013 client IO

// @onelogic Elements that are used in onedata web app
// TODO Felix delete all elements not needed

if (typeof exports === 'object') {

  var joint = {
    util: require('../src/core').util,
    shapes: {
      basic: require('./joint.shapes.basic')
    },
    dia: {
      Link: require('../src/joint.dia.link').Link
    }
  };
}

//"enum" with all dataTypes of ports
var oneData = {};
oneData.dataType = {
  FLOAT : 'float',
  DOUBLE: 'double',
  INT : 'int',
  STRING : 'string',
  GEO : 'geo',
  DATATIME: 'datetime'
};

joint.shapes.logic = {};

joint.shapes.logic.Gate = joint.shapes.basic.Generic.extend({

  defaults: joint.util.deepSupplement({

    type: 'logic.Gate',
    size: { width: 80, height: 40 },
    attrs: {
      '.': { magnet: false },
      '.body': { width: 100, height: 50 },
      circle: { r: 6, stroke: 'black', fill: 'transparent', 'stroke-width': 1 }
    }

  }, joint.shapes.basic.Generic.prototype.defaults),

  operation: function() { return true; }
});

joint.shapes.logic.IO = joint.shapes.logic.Gate.extend({

  markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><path class="wire"/><circle/><text/></g>',

  defaults: joint.util.deepSupplement({

    type: 'logic.IO',
    size: { width: 100, height: 30 },
    attrs: {
      '.body': { fill: 'white', stroke: 'black', 'stroke-width': 2 },
      '.wire': { ref: '.body', 'ref-y': .5, stroke: 'black'},
      text: {
        fill: 'black',
        ref: '.body', 'ref-x': .5, 'ref-y': .5, 'y-alignment': 'middle',
        'text-anchor': 'middle',
        'font-weight': 'bold',
        'font-variant': 'small-caps', 
        'text-transform': 'capitalize',
        'font-size': '14px'
      }
    }

  }, joint.shapes.logic.Gate.prototype.defaults)

});

joint.shapes.logic.Input = joint.shapes.logic.IO.extend({

  defaults: joint.util.deepSupplement({

    type: 'logic.Input',
    attrs: {
      '.wire': { 'ref-dx': 0, d: 'M 0 0 L 23 0' },
      circle: { ref: '.body', 'ref-dx': 30, 'ref-y': 0.5, magnet: true, 'class': 'output', port: 'out' },
      text: { text: 'input' }
    }

  }, joint.shapes.logic.IO.prototype.defaults)
});

joint.shapes.logic.Output = joint.shapes.logic.IO.extend({

  defaults: joint.util.deepSupplement({

    type: 'logic.Output',
    attrs: {
      '.wire': { 'ref-x': 0, d: 'M 0 0 L -23 0' },
      circle: { ref: '.body', 'ref-x': -30, 'ref-y': 0.5, magnet: 'passive', 'class': 'input', port: 'in' },
      text: { text: 'output' }
    }

  }, joint.shapes.logic.IO.prototype.defaults)

});

joint.shapes.logic.Wire = joint.dia.Link.extend({

  arrowheadMarkup: [
  '<g class="marker-arrowhead-group marker-arrowhead-group-<%= end %>">',
  '<circle class="marker-arrowhead" end="<%= end %>" r="7"/>',
  '</g>'
  ].join(''),

  vertexMarkup: [
  '<g class="marker-vertex-group" transform="translate(<%= x %>, <%= y %>)">',
  '<circle class="marker-vertex" idx="<%= idx %>" r="10" />',
  '<g class="marker-vertex-remove-group">',
  '<path class="marker-vertex-remove-area" idx="<%= idx %>" d="M16,5.333c-7.732,0-14,4.701-14,10.5c0,1.982,0.741,3.833,2.016,5.414L2,25.667l5.613-1.441c2.339,1.317,5.237,2.107,8.387,2.107c7.732,0,14-4.701,14-10.5C30,10.034,23.732,5.333,16,5.333z" transform="translate(5, -33)"/>',
  '<path class="marker-vertex-remove" idx="<%= idx %>" transform="scale(.8) translate(9.5, -37)" d="M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z">',
  '<title>Remove vertex.</title>',
  '</path>',
  '</g>',
  '</g>'
  ].join(''),

  defaults: joint.util.deepSupplement({

    type: 'logic.Wire',

    attrs: {
      '.connection': { 'stroke-width': 2 },
      '.marker-vertex': { r: 7 }
    },

    router: { name: 'orthogonal' },
    connector: { name: 'rounded', args: { radius: 10 }},

  }, joint.dia.Link.prototype.defaults)

});

//generic 3 input 1 output element
joint.shapes.logic.Gate31 = joint.shapes.logic.Gate.extend({

  markup: '<g class="rotatable"><g class="scalable"><image class="body" /></g><circle class="input input1"/><circle  class="input input2" /> <circle class="input input3"/><circle class="output"/></g>',

  defaults: joint.util.deepSupplement({

    type: 'logic.Gate31',
    superType: 'oneData.WorkflowNode',
    attrs: {
      '.input1': { ref: '.body', 'ref-x': -2, 'ref-y': 0.1, magnet: 'passive'},
      '.input2': { ref: '.body', 'ref-x': -2, 'ref-y': 0.5, magnet: 'passive'},
      '.input3': { ref: '.body', 'ref-x': -2, 'ref-y': 0.9, magnet: 'passive'},
      '.output': { ref: '.body', 'ref-dx': 2, 'ref-y': 0.5, magnet: true,}
    }

  }, joint.shapes.logic.Gate.prototype.defaults)
});


joint.shapes.logic.Custom = joint.shapes.logic.Gate31.extend({

  defaults: joint.util.deepSupplement({

    type: 'logic.Custom',
    supertype: 'oneData.WorkflowNode',
    inPorts: [{port: 'in1', dataType: oneData.dataType.INT, isOptional: false },
    {port: 'in2', dataType: oneData.dataType.STRING, isOptional: false },
    {port: 'in3', dataType: oneData.dataType.FLOAT, isOptional: false }],
    outPorts: [{port: 'out', dataType: oneData.dataType.INT}],

    attrs: { 
      '.input1': { port: 'in1', dataType: oneData.dataType.INT},
      '.input2': { port: 'in2', dataType: oneData.dataType.STRING},
      '.input3': { port: 'in3', dataType: oneData.dataType.FLOAT},
      '.output': { port: 'out', dataType: oneData.dataType.INT },

      image: { 'xlink:href': 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+Cjxzdmcgd' +
      '2lkdGg9IjEwMCIgaGVpZ2h0PSI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB' +
      '4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KCiA8bWV0YWRhdGEgaWQ9Im1ldGFkYXRhNy' +
      'I+aW1hZ2Uvc3ZnK3htbDwvbWV0YWRhdGE+CiA8Zz4KICA8dGl0bGU+TGF5ZXIgMTwvdGl0bGU+CiAgPGcgaWQ9Imxhe' +
      'WVyMSI+CiAgIDxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIzIiBpZD0icGF0aDMw' +
      'NTkiIGQ9Im03OS4xNTY4OTgsMjVsMTUuODQzMTAyLDAiLz4KICAgPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiB' +
      'zdHJva2Utd2lkdGg9IjMiIGlkPSJwYXRoMzA2MSIgZD0ibTI5LjA0MzUwMSwyNWwtMjQuMDAwMDIxLDAiLz4KICAgPHBhdGggZmlsbD' +
      '0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIzIiBpZD0icGF0aDI2MzgiIGQ9Im0yOC45Njg4LDIuNTkzNzVsMCwyLjQwNjI1bDAsNDBsMCwyL' +
      'jQwNjNsMi4xNTYyLC0xLjA2MjVsNDEuMDMxMzAzLC0yMGwwLC0yLjY4NzVsLTQxLjAzMTMwMywtMjAuMDAwMDVsLTIuMTU2MiwtMS4wNjI1em0z' +
      'LDQuODEyNWwzNi4xMjUwMDQsMTcuNTkzNzVsLTM2LjEyNTAwNCwxNy41OTM4bDAsLTM1LjE4NzU1eiIvPgogICA8' +
      'cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMyIgZD0ibTc5LDI1YTQsNCAwIDE' +
      'gMSAtOCwwYTQsNCAwIDEgMSA4LDB6IiBpZD0icGF0aDI2NzEiLz4KICA8L2c+CiAgPGxpbmUgaWQ9InN2Z182IiB5Mj' +
      '0iNC40NjE0MjQiIHgyPSI0Ljk2OTQ0NSIgeTE9IjQuNDYxNDI0IiB4MT0iMjkuMzQ1ODgzIiBzdHJva2Utd2lkdGg9Ij' +
      'MiIHN0cm9rZT0iIzAwMDAwMCIgZmlsbD0ibm9uZSIvPgogIDxsaW5lIGlkPSJzdmdfNyIgeTI9IjQ1Ljg0MTQyOCIgeDI' +
      '9IjQuNTAwMjA5IiB5MT0iNDUuODQxNDI4IiB4MT0iMjkuMjEyMzk5IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZT0iIzAwM' +
      'DAwMCIgZmlsbD0ibm9uZSIvPgogPC9nPgo8L3N2Zz4=' }}

    }, joint.shapes.logic.Gate31.prototype.defaults),

operation: function (input1, input2, input3) {
  return input1 || input2 || input3;
}
});

//generic 2 input 3 output element
joint.shapes.logic.Gate23 = joint.shapes.logic.Gate.extend({

  markup: '<g class="rotatable"><g class="scalable"><image class="body" /></g><circle class="input input1"/><circle  class="input input2" /><circle class="output output1"/><circle class="output output2"/><circle class="output output3"/></g>',

  defaults: joint.util.deepSupplement({

    type: 'logic.Gate23',
    superType: 'oneData.WorkflowNode',
    attrs: {
      '.input1': { ref: '.body', 'ref-x': -2, 'ref-y': 0.3, magnet: 'passive'},
      '.input2': { ref: '.body', 'ref-x': -2, 'ref-y': 0.7, magnet: 'passive'},
      '.output1': { ref: '.body', 'ref-dx': 2, 'ref-y': 0.1, magnet: true,},
      '.output2': { ref: '.body', 'ref-dx': 2, 'ref-y': 0.5, magnet: true,},
      '.output3': { ref: '.body', 'ref-dx': 2, 'ref-y': 0.9, magnet: true,}
    }

  }, joint.shapes.logic.Gate.prototype.defaults)
});

joint.shapes.logic.Cluster = joint.shapes.logic.Gate23.extend({

  defaults: joint.util.deepSupplement({

    type: 'logic.Cluster',
    supertype: 'oneData.WorkflowNode',
    processorId: 'a1298600-bbb1-45d9-a624-6371b92d2a35',

    //ports have to be unique for node as per JointJS specification but only unique for input/output-ports in ONE DATA specification
    inPorts: [{ port: 'input.OriginData', dataType: oneData.dataType.DOUBLE, allowedScales: ["Metric", "Ratio"], isOptional: false },
      { port: 'ClusterConfig', dataType: oneData.dataType.INT, allowedScales: ["Metric", "Ratio"], isOptional: false }],
    outPorts: [{ port: 'output.OriginData', dataType: oneData.dataType.INT, allowedScales: ["Metric", "Ratio"], isOptional: false },
      { port: 'Clusters', dataType: oneData.dataType.DOUBLE, allowedScales: ["Metric", "Ratio"], isOptional: false },
      { port: 'RowIsInCluster', dataType: oneData.dataType.INT, allowedScales: ["Metric", "Ratio"], isOptional: false }],
    configPorts: [],

    attrs: { 
      '.input1': { port: 'input.OriginData', dataType: oneData.dataType.DOUBLE, allowedScales: ["Metric", "Ratio"], isOptional: false },
      '.input2': { port: 'ClusterConfig', dataType: oneData.dataType.INT, allowedScales: ["Metric", "Ratio"], isOptional: false },
      '.output1': { port: 'output.OriginData', dataType: oneData.dataType.INT, allowedScales: ["Metric", "Ratio"], isOptional: false },
      '.output2': { port: 'Clusters', dataType: oneData.dataType.DOUBLE, allowedScales: ["Metric", "Ratio"], isOptional: false },
      '.output3': { port: 'RowIsInCluster', dataType: oneData.dataType.INT, allowedScales: ["Metric", "Ratio"], isOptional: false },

      image: { 'xlink:href': 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgo8c3ZnCiAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgeG1sbnM6Y2M9Imh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL25zIyIKICAgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIgogICB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zOnNvZGlwb2RpPSJodHRwOi8vc29kaXBvZGkuc291cmNlZm9yZ2UubmV0L0RURC9zb2RpcG9kaS0wLmR0ZCIKICAgeG1sbnM6aW5rc2NhcGU9Imh0dHA6Ly93d3cuaW5rc2NhcGUub3JnL25hbWVzcGFjZXMvaW5rc2NhcGUiCiAgIHdpZHRoPSIxMDAiCiAgIGhlaWdodD0iNTAiCiAgIGlkPSJzdmcyIgogICBzb2RpcG9kaTp2ZXJzaW9uPSIwLjMyIgogICBpbmtzY2FwZTp2ZXJzaW9uPSIwLjQ2IgogICB2ZXJzaW9uPSIxLjAiCiAgIHNvZGlwb2RpOmRvY25hbWU9Ik5BTkQgQU5TSS5zdmciCiAgIGlua3NjYXBlOm91dHB1dF9leHRlbnNpb249Im9yZy5pbmtzY2FwZS5vdXRwdXQuc3ZnLmlua3NjYXBlIj4KICA8ZGVmcwogICAgIGlkPSJkZWZzNCI+CiAgICA8aW5rc2NhcGU6cGVyc3BlY3RpdmUKICAgICAgIHNvZGlwb2RpOnR5cGU9Imlua3NjYXBlOnBlcnNwM2QiCiAgICAgICBpbmtzY2FwZTp2cF94PSIwIDogMTUgOiAxIgogICAgICAgaW5rc2NhcGU6dnBfeT0iMCA6IDEwMDAgOiAwIgogICAgICAgaW5rc2NhcGU6dnBfej0iNTAgOiAxNSA6IDEiCiAgICAgICBpbmtzY2FwZTpwZXJzcDNkLW9yaWdpbj0iMjUgOiAxMCA6IDEiCiAgICAgICBpZD0icGVyc3BlY3RpdmUyNzE0IiAvPgogICAgPGlua3NjYXBlOnBlcnNwZWN0aXZlCiAgICAgICBzb2RpcG9kaTp0eXBlPSJpbmtzY2FwZTpwZXJzcDNkIgogICAgICAgaW5rc2NhcGU6dnBfeD0iMCA6IDAuNSA6IDEiCiAgICAgICBpbmtzY2FwZTp2cF95PSIwIDogMTAwMCA6IDAiCiAgICAgICBpbmtzY2FwZTp2cF96PSIxIDogMC41IDogMSIKICAgICAgIGlua3NjYXBlOnBlcnNwM2Qtb3JpZ2luPSIwLjUgOiAwLjMzMzMzMzMzIDogMSIKICAgICAgIGlkPSJwZXJzcGVjdGl2ZTI4MDYiIC8+CiAgICA8aW5rc2NhcGU6cGVyc3BlY3RpdmUKICAgICAgIGlkPSJwZXJzcGVjdGl2ZTI4MTkiCiAgICAgICBpbmtzY2FwZTpwZXJzcDNkLW9yaWdpbj0iMzcyLjA0NzI0IDogMzUwLjc4NzM5IDogMSIKICAgICAgIGlua3NjYXBlOnZwX3o9Ijc0NC4wOTQ0OCA6IDUyNi4xODEwOSA6IDEiCiAgICAgICBpbmtzY2FwZTp2cF95PSIwIDogMTAwMCA6IDAiCiAgICAgICBpbmtzY2FwZTp2cF94PSIwIDogNTI2LjE4MTA5IDogMSIKICAgICAgIHNvZGlwb2RpOnR5cGU9Imlua3NjYXBlOnBlcnNwM2QiIC8+CiAgICA8aW5rc2NhcGU6cGVyc3BlY3RpdmUKICAgICAgIGlkPSJwZXJzcGVjdGl2ZTI3NzciCiAgICAgICBpbmtzY2FwZTpwZXJzcDNkLW9yaWdpbj0iNzUgOiA0MCA6IDEiCiAgICAgICBpbmtzY2FwZTp2cF96PSIxNTAgOiA2MCA6IDEiCiAgICAgICBpbmtzY2FwZTp2cF95PSIwIDogMTAwMCA6IDAiCiAgICAgICBpbmtzY2FwZTp2cF94PSIwIDogNjAgOiAxIgogICAgICAgc29kaXBvZGk6dHlwZT0iaW5rc2NhcGU6cGVyc3AzZCIgLz4KICAgIDxpbmtzY2FwZTpwZXJzcGVjdGl2ZQogICAgICAgaWQ9InBlcnNwZWN0aXZlMzI3NSIKICAgICAgIGlua3NjYXBlOnBlcnNwM2Qtb3JpZ2luPSI1MCA6IDMzLjMzMzMzMyA6IDEiCiAgICAgICBpbmtzY2FwZTp2cF96PSIxMDAgOiA1MCA6IDEiCiAgICAgICBpbmtzY2FwZTp2cF95PSIwIDogMTAwMCA6IDAiCiAgICAgICBpbmtzY2FwZTp2cF94PSIwIDogNTAgOiAxIgogICAgICAgc29kaXBvZGk6dHlwZT0iaW5rc2NhcGU6cGVyc3AzZCIgLz4KICAgIDxpbmtzY2FwZTpwZXJzcGVjdGl2ZQogICAgICAgaWQ9InBlcnNwZWN0aXZlNTUzMyIKICAgICAgIGlua3NjYXBlOnBlcnNwM2Qtb3JpZ2luPSIzMiA6IDIxLjMzMzMzMyA6IDEiCiAgICAgICBpbmtzY2FwZTp2cF96PSI2NCA6IDMyIDogMSIKICAgICAgIGlua3NjYXBlOnZwX3k9IjAgOiAxMDAwIDogMCIKICAgICAgIGlua3NjYXBlOnZwX3g9IjAgOiAzMiA6IDEiCiAgICAgICBzb2RpcG9kaTp0eXBlPSJpbmtzY2FwZTpwZXJzcDNkIiAvPgogIDwvZGVmcz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaWQ9ImJhc2UiCiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEuMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMC4wIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6em9vbT0iMTYiCiAgICAgaW5rc2NhcGU6Y3g9Ijc4LjI4MzMwNyIKICAgICBpbmtzY2FwZTpjeT0iMTYuNDQyODQzIgogICAgIGlua3NjYXBlOmRvY3VtZW50LXVuaXRzPSJweCIKICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJsYXllcjEiCiAgICAgc2hvd2dyaWQ9InRydWUiCiAgICAgaW5rc2NhcGU6Z3JpZC1iYm94PSJ0cnVlIgogICAgIGlua3NjYXBlOmdyaWQtcG9pbnRzPSJ0cnVlIgogICAgIGdyaWR0b2xlcmFuY2U9IjEwMDAwIgogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTM5OSIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSI4NzQiCiAgICAgaW5rc2NhcGU6d2luZG93LXg9IjMzIgogICAgIGlua3NjYXBlOndpbmRvdy15PSIwIgogICAgIGlua3NjYXBlOnNuYXAtYmJveD0idHJ1ZSI+CiAgICA8aW5rc2NhcGU6Z3JpZAogICAgICAgaWQ9IkdyaWRGcm9tUHJlMDQ2U2V0dGluZ3MiCiAgICAgICB0eXBlPSJ4eWdyaWQiCiAgICAgICBvcmlnaW54PSIwcHgiCiAgICAgICBvcmlnaW55PSIwcHgiCiAgICAgICBzcGFjaW5neD0iMXB4IgogICAgICAgc3BhY2luZ3k9IjFweCIKICAgICAgIGNvbG9yPSIjMDAwMGZmIgogICAgICAgZW1wY29sb3I9IiMwMDAwZmYiCiAgICAgICBvcGFjaXR5PSIwLjIiCiAgICAgICBlbXBvcGFjaXR5PSIwLjQiCiAgICAgICBlbXBzcGFjaW5nPSI1IgogICAgICAgdmlzaWJsZT0idHJ1ZSIKICAgICAgIGVuYWJsZWQ9InRydWUiIC8+CiAgPC9zb2RpcG9kaTpuYW1lZHZpZXc+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhNyI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGcKICAgICBpbmtzY2FwZTpsYWJlbD0iTGF5ZXIgMSIKICAgICBpbmtzY2FwZTpncm91cG1vZGU9ImxheWVyIgogICAgIGlkPSJsYXllcjEiPgogICAgPHBhdGgKICAgICAgIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjI7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgIGQ9Ik0gNzksMjUgQyA5MS44LDI1IDk1LDI1IDk1LDI1IgogICAgICAgaWQ9InBhdGgzMDU5IgogICAgICAgc29kaXBvZGk6bm9kZXR5cGVzPSJjYyIgLz4KICAgIDxwYXRoCiAgICAgICBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDoyO3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1vcGFjaXR5OjEiCiAgICAgICBkPSJNIDMxLDE1IDUsMTUiCiAgICAgICBpZD0icGF0aDMwNjEiIC8+CiAgICA8cGF0aAogICAgICAgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwMDAwMDtzdHJva2Utd2lkdGg6MS45OTk5OTk4ODtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2Utb3BhY2l0eToxIgogICAgICAgZD0iTSAzMiwzNSA1LDM1IgogICAgICAgaWQ9InBhdGgzOTQ0IiAvPgogICAgPHBhdGgKICAgICAgIHN0eWxlPSJmb250LXNpemU6bWVkaXVtO2ZvbnQtc3R5bGU6bm9ybWFsO2ZvbnQtdmFyaWFudDpub3JtYWw7Zm9udC13ZWlnaHQ6bm9ybWFsO2ZvbnQtc3RyZXRjaDpub3JtYWw7dGV4dC1pbmRlbnQ6MDt0ZXh0LWFsaWduOnN0YXJ0O3RleHQtZGVjb3JhdGlvbjpub25lO2xpbmUtaGVpZ2h0Om5vcm1hbDtsZXR0ZXItc3BhY2luZzpub3JtYWw7d29yZC1zcGFjaW5nOm5vcm1hbDt0ZXh0LXRyYW5zZm9ybTpub25lO2RpcmVjdGlvbjpsdHI7YmxvY2stcHJvZ3Jlc3Npb246dGI7d3JpdGluZy1tb2RlOmxyLXRiO3RleHQtYW5jaG9yOnN0YXJ0O2ZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MzttYXJrZXI6bm9uZTt2aXNpYmlsaXR5OnZpc2libGU7ZGlzcGxheTppbmxpbmU7b3ZlcmZsb3c6dmlzaWJsZTtlbmFibGUtYmFja2dyb3VuZDphY2N1bXVsYXRlO2ZvbnQtZmFtaWx5OkJpdHN0cmVhbSBWZXJhIFNhbnM7LWlua3NjYXBlLWZvbnQtc3BlY2lmaWNhdGlvbjpCaXRzdHJlYW0gVmVyYSBTYW5zIgogICAgICAgZD0iTSAzMCw1IEwgMzAsNi40Mjg1NzE0IEwgMzAsNDMuNTcxNDI5IEwgMzAsNDUgTCAzMS40Mjg1NzEsNDUgTCA1MC40NzYxOSw0NSBDIDYxLjc0NDA5OCw0NSA3MC40NzYxOSwzNS45OTk5NTUgNzAuNDc2MTksMjUgQyA3MC40NzYxOSwxNC4wMDAwNDUgNjEuNzQ0MDk5LDUuMDAwMDAwMiA1MC40NzYxOSw1IEMgNTAuNDc2MTksNSA1MC40NzYxOSw1IDMxLjQyODU3MSw1IEwgMzAsNSB6IE0gMzIuODU3MTQzLDcuODU3MTQyOSBDIDQwLjgzNDI2NCw3Ljg1NzE0MjkgNDUuOTE4MzY4LDcuODU3MTQyOSA0OC4wOTUyMzgsNy44NTcxNDI5IEMgNDkuMjg1NzE0LDcuODU3MTQyOSA0OS44ODA5NTIsNy44NTcxNDI5IDUwLjE3ODU3MSw3Ljg1NzE0MjkgQyA1MC4zMjczODEsNy44NTcxNDI5IDUwLjQwOTIyNyw3Ljg1NzE0MjkgNTAuNDQ2NDI5LDcuODU3MTQyOSBDIDUwLjQ2NTAyOSw3Ljg1NzE0MjkgNTAuNDcxNTQzLDcuODU3MTQyOSA1MC40NzYxOSw3Ljg1NzE0MjkgQyA2MC4yMzY4NTMsNy44NTcxNDMgNjcuMTQyODU3LDE1LjQ5NzA5OCA2Ny4xNDI4NTcsMjUgQyA2Ny4xNDI4NTcsMzQuNTAyOTAyIDU5Ljc2MDY2Miw0Mi4xNDI4NTcgNTAsNDIuMTQyODU3IEwgMzIuODU3MTQzLDQyLjE0Mjg1NyBMIDMyLjg1NzE0Myw3Ljg1NzE0MjkgeiIKICAgICAgIGlkPSJwYXRoMjg4NCIKICAgICAgIHNvZGlwb2RpOm5vZGV0eXBlcz0iY2NjY2Njc2NjY2Nzc3Nzc2NjYyIgLz4KICAgIDxwYXRoCiAgICAgICBzb2RpcG9kaTp0eXBlPSJhcmMiCiAgICAgICBzdHlsZT0iZmlsbDpub25lO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDozO3N0cm9rZS1saW5lam9pbjptaXRlcjttYXJrZXI6bm9uZTtzdHJva2Utb3BhY2l0eToxO3Zpc2liaWxpdHk6dmlzaWJsZTtkaXNwbGF5OmlubGluZTtvdmVyZmxvdzp2aXNpYmxlO2VuYWJsZS1iYWNrZ3JvdW5kOmFjY3VtdWxhdGUiCiAgICAgICBpZD0icGF0aDQwMDgiCiAgICAgICBzb2RpcG9kaTpjeD0iNzUiCiAgICAgICBzb2RpcG9kaTpjeT0iMjUiCiAgICAgICBzb2RpcG9kaTpyeD0iNCIKICAgICAgIHNvZGlwb2RpOnJ5PSI0IgogICAgICAgZD0iTSA3OSwyNSBBIDQsNCAwIDEgMSA3MSwyNSBBIDQsNCAwIDEgMSA3OSwyNSB6IiAvPgogIDwvZz4KPC9zdmc+Cg==' }}

    }, joint.shapes.logic.Gate23.prototype.defaults),

operation: function (input1, input2) {
  return input1 || input2;
}
});

joint.shapes.logic.Gate24 = joint.shapes.logic.Gate.extend({
  
  markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><circle class="input input1"/><circle class="input input2"/><circle class="output output1"/><circle class="output output2"/><circle class="output output3"/><circle class="output output4"/><text/></g>',

  defaults: joint.util.deepSupplement({

    type: 'logic.Gate24',
    superType: 'oneData.WorkflowNode',
    size: { width: 100, height: 60 },
    attrs: {
      '.body': { fill: 'white', stroke: 'black', 'stroke-width': 2 },
      '.input1': { ref: '.body', 'ref-x': -2, 'ref-y': 0.3, magnet: 'passive'},
      '.input2': { ref: '.body', 'ref-x': -2, 'ref-y': 0.7, magnet: 'passive'},
      '.output1': { ref: '.body', 'ref-dx': 2, 'ref-y': 0.1, magnet: true,},
      '.output2': { ref: '.body', 'ref-dx': 2, 'ref-y': 0.365, magnet: true,},
      '.output3': { ref: '.body', 'ref-dx': 2, 'ref-y': 0.635, magnet: true,}, 
      '.output4': { ref: '.body', 'ref-dx': 2, 'ref-y': 0.9, magnet: true,},
      text: {
        fill: 'black',
        ref: '.body', 'ref-x': .5, 'ref-y': .2, 'y-alignment': 'middle',
        'text-anchor': 'middle',
        'font-weight': 'bold',
        'font-variant': 'small-caps', 
        'text-transform': 'capitalize',
        'font-size': '12px'
      }
    }

  }, joint.shapes.logic.Gate.prototype.defaults)

});

joint.shapes.logic.Regression = joint.shapes.logic.Gate24.extend({

  defaults: joint.util.deepSupplement({

    type: 'logic.Regression',
    processorId: '9163546f-0883-454d-9537-346271b2a6f1',
    inPorts: [{ port: 'input.OriginData', dataType: oneData.dataType.DOUBLE, allowedScales: ["Metric", "Ratio"], isOptional: false },
      { port: 'Regressand', dataType: oneData.dataType.STRING, allowedScales: ["Metric", "Ratio"], isOptional: false }],
    outPorts: [{ port: 'output.OriginData', dataType: oneData.dataType.DOUBLE, allowedScales: ["Metric", "Ratio"], isOptional: false },
      { port: 'Validation', dataType: oneData.dataType.DOUBLE, allowedScales: ["Metric", "Ratio"], isOptional: false },
      { port: 'ValidationColumn', dataType: oneData.dataType.DOUBLE, allowedScales: ["Metric", "Ratio"], isOptional: false },
      { port: 'Parameter', dataType: oneData.dataType.DOUBLE, allowedScales: ["Metric", "Ratio"], isOptional: false }],
    configPorts: [],
    attrs: {
      '.input1': { port: 'input.OriginData', dataType: oneData.dataType.DOUBLE, allowedScales: ["Metric", "Ratio"], isOptional: false },
      '.input2': { port: 'Regressand', dataType: oneData.dataType.STRING, allowedScales: ["Metric", "Ratio"], isOptional: false },
      '.output1': { port: 'output.OriginData', dataType: oneData.dataType.DOUBLE, allowedScales: ["Metric", "Ratio"], isOptional: false },
      '.output2': { port: 'Validation', dataType: oneData.dataType.DOUBLE, allowedScales: ["Metric", "Ratio"], isOptional: false },
      '.output3': { port: 'ValidationColumn', dataType: oneData.dataType.DOUBLE, allowedScales: ["Metric", "Ratio"], isOptional: false },
      '.output4': { port: 'Parameter', dataType: oneData.dataType.DOUBLE, allowedScales: ["Metric", "Ratio"], isOptional: false },
      text: { text: 'Regression' }
    }

  }, joint.shapes.logic.Gate24.prototype.defaults)
});

joint.shapes.logic.Gate11 = joint.shapes.logic.Gate.extend({
  
  /*<path class="wire"/>*/
  markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><circle class="input input1"/><circle class="output output1"/><text/></g>',

  defaults: joint.util.deepSupplement({

    type: 'logic.Gate11',
    superType: 'oneData.WorkflowNode',
    size: { width: 100, height: 60 },
    attrs: {
      '.body': { fill: 'white', stroke: 'black', 'stroke-width': 2 },
      //'.wire': { ref: '.body', 'ref-y': .5, stroke: 'black'},

      '.input1': { ref: '.body', 'ref-x': -2, 'ref-y': 0.5, magnet: 'passive'},
      '.output1': { ref: '.body', 'ref-dx': 2, 'ref-y': 0.5, magnet: true,},
      text: {
        fill: 'black',
        ref: '.body', 'ref-x': .5, 'ref-y': .2, 'y-alignment': 'middle',
        'text-anchor': 'middle',
        'font-weight': 'bold',
        'font-variant': 'small-caps', 
        'text-transform': 'capitalize',
        'font-size': '14px'
      }
    }

  }, joint.shapes.logic.Gate.prototype.defaults)

});

//
// General 2->1 ports node element. See joint.shapes.logic.Join for an acutal implementation.
//
joint.shapes.logic.Gate21 = joint.shapes.logic.Gate.extend({
  
  markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><circle class="input input1"/><circle class="input input2"/><circle class="output output1"/><text/></g>',

  defaults: joint.util.deepSupplement({

    type: 'logic.Gate21',
    superType: 'oneData.WorkflowNode',
    size: { width: 100, height: 60 },
    attrs: {
      '.body': { fill: 'white', stroke: 'black', 'stroke-width': 2 },

      '.input1': { ref: '.body', 'ref-x': -2, 'ref-y': 0.3, magnet: 'passive'},
      '.input2': { ref: '.body', 'ref-x': -2, 'ref-y': 0.7, magnet: 'passive'},
      '.output1': { ref: '.body', 'ref-dx': 2, 'ref-y': 0.5, magnet: true,},
      text: {
        fill: 'black',
        ref: '.body', 'ref-x': .5, 'ref-y': .2, 'y-alignment': 'middle',
        'text-anchor': 'middle',
        'font-weight': 'bold',
        'font-variant': 'small-caps', 
        'text-transform': 'capitalize',
        'font-size': '14px'
      }
    }

  }, joint.shapes.logic.Gate.prototype.defaults)

});

//
// Specific element with 2 inputs and 1 output
// This is an example of an onedata processor object. Ports may hold types of data they
// can be connected to (see oneData.dataType enum on top). Another possible attribute could be isOptional (though not used atm)
// Don't forget to set both the model and the gui element like here (needed for overall accessibility)
//
joint.shapes.logic.Join = joint.shapes.logic.Gate21.extend({

  defaults: joint.util.deepSupplement({

    type: 'logic.Join',
    processorId: 'join',
    inPorts: [{port: 'input1', dataType: oneData.dataType.INT, isOptional: false },
    {port: 'input2', dataType: oneData.dataType.INT, isOptional: false }],
    outPorts: [{port: 'output1', dataType: oneData.dataType.INT}],
    attrs: {
      '.input1': { port: 'input1', dataType: oneData.dataType.INT},
      '.input2': { port: 'input2', dataType: oneData.dataType.INT},
      '.output1': { port: 'output1', dataType: oneData.dataType.INT },
      text: { text: 'Join' }
    }

  }, joint.shapes.logic.Gate21.prototype.defaults)
});

// joint.shapes.logic.Regression = joint.shapes.logic.Gate11.extend({

//   defaults: joint.util.deepSupplement({

//     type: 'logic.Regression',
//     processorId: 'regression',
//     inPorts: [{port: 'input1', dataType: oneData.dataType.INT, isOptional: false }],
//     outPorts: [{port: 'output1', dataType: oneData.dataType.INT}],
//     attrs: {
//       '.input1': { port: 'input1', dataType: oneData.dataType.INT},
//       '.output1': { port: 'output1', dataType: oneData.dataType.INT },
//       text: { text: 'Regression' }
//     }

//   }, joint.shapes.logic.Gate11.prototype.defaults)
// });

//connection between elements
joint.shapes.logic.Connection = joint.dia.Link.extend({
  arrowheadMarkup: [
  '<g class="marker-arrowhead-group marker-arrowhead-group-<%= end %>">',
  '<circle class="marker-arrowhead" end="<%= end %>" r="7"/>',
  '</g>'
  ].join(''),

  vertexMarkup: [
  '<g class="marker-vertex-group" transform="translate(<%= x %>, <%= y %>)">',
  '<circle class="marker-vertex" idx="<%= idx %>" r="10" />',
  '<g class="marker-vertex-remove-group">',
  '<path class="marker-vertex-remove-area" idx="<%= idx %>" d="M16,5.333c-7.732,0-14,4.701-14,10.5c0,1.982,0.741,3.833,2.016,5.414L2,25.667l5.613-1.441c2.339,1.317,5.237,2.107,8.387,2.107c7.732,0,14-4.701,14-10.5C30,10.034,23.732,5.333,16,5.333z" transform="translate(5, -33)"/>',
  '<path class="marker-vertex-remove" idx="<%= idx %>" transform="scale(.8) translate(9.5, -37)" d="M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z">',
  '<title>Remove vertex.</title>',
  '</path>',
  '</g>',
  '</g>'
  ].join(''),

  defaults: joint.util.deepSupplement({

        //type has to be exactly the namespace without 'joint.shapes'
        type: 'logic.Connection',
        superType: 'oneData.WorkflowEdge',

        attrs: {
          '.connection': { 'stroke-width': 2 },
          '.marker-vertex': { r: 7 }
        },

        //http://de.wikipedia.org/wiki/Manhattan_Routing
        manhattan: false

      }, joint.dia.Link.prototype.defaults)

});

if (typeof exports === 'object') {

  module.exports = joint.shapes.logic;
}
