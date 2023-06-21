/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { saveAs } from 'file-saver';
import * as Blockly from 'blockly';
import {blocks} from './blocks/text';
import {generator} from './generators/javascript';
import {javascriptGenerator} from 'blockly/javascript';
import {save, load} from './serialization';
import {toolbox} from './toolbox';
import './index.css';

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(blocks);
Object.assign(javascriptGenerator, generator);

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('generatedCode').firstChild;
const outputDiv = document.getElementById('output');
const blocklyDiv = document.getElementById('blocklyDiv');
const ws = Blockly.inject(blocklyDiv, {toolbox});

document.getElementById('guardarBtn').addEventListener('click', function () {
  var link = document.createElement('a');
  link.href = '#';
  link.download = 'nombre_del_archivo.xml';

  if (typeof link.download === 'undefined') {
    var fileDialog = document.createElement('input');
    fileDialog.type = 'file';
    fileDialog.accept = '.xml';
    fileDialog.style.display = 'none';

    fileDialog.addEventListener('change', function (event) {
      var file = event.target.files[0];
      if (file) {
        guardarProyecto(file);
      }
    });

    document.body.appendChild(fileDialog);
    fileDialog.click();
    document.body.removeChild(fileDialog);
  } else {
    link.addEventListener('click', function () {
      guardarProyecto(link);
    });

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
});

document.getElementById('cargarBtn').addEventListener('click', function() {
  var archivoInput = document.createElement('input');
  archivoInput.type = 'file';
  archivoInput.accept = '.xml';
  archivoInput.style.display = 'none';

  archivoInput.addEventListener('change', function(event) {
    var archivo = event.target.files[0];
    cargarProyecto(archivo);
  });

  archivoInput.click();
});

document.getElementById('limpiarBtn').addEventListener('click', function() {
  limpiarWorkspace();
});

function limpiarWorkspace() {
  Blockly.mainWorkspace.clear();
  console.log('Workspace limpiado.');
}

function cargarProyecto(archivo) {
  var lector = new FileReader();
  lector.onload = function(event) {
    var xmlText = event.target.result;
    var xml = Blockly.Xml.textToDom(xmlText);
    Blockly.Xml.clearWorkspaceAndLoadFromXml(xml, ws);
    console.log('Proyecto cargado desde archivo.');
  };
  lector.readAsText(archivo);
}


function guardarProyecto(file) {
  const xml = Blockly.Xml.workspaceToDom(ws);
  const xmlText = Blockly.Xml.domToText(xml);

  var blob = new Blob([xmlText], { type: 'application/xml' });

  if (typeof file.download === 'xml') {
    var reader = new FileReader();
    reader.onload = function (event) {
      var save = document.createElement('a');
      save.href = event.target.result;
      save.target = '_blank';
      save.download = file.name || 'nombre_del_archivo.xml';

      var event = document.createEvent('MouseEvents');
      event.initMouseEvent(
        'click',
        true,
        false,
        window,
        0,
        0,
        0,
        0,
         /* left */ 0,
        false,
        false,
        false,
        false,
        0,
        null
      );
      save.dispatchEvent(event);
      (window.URL || window.webkitURL).revokeObjectURL(save.href);
    };
    reader.readAsDataURL(blob);
  } else {
    file.href = (window.URL || window.webkitURL).createObjectURL(blob);
  }
}

function guardarProyectoConExplorador(archivo) {
  console.log('entro guardar')
  var xml = Blockly.Xml.workspaceToDom(ws);
  var xmlText = Blockly.Xml.domToText(xml);

  var blob = new Blob([xmlText], { type: 'application/xml' });
  saveAs(blob, archivo.name);

  console.log('Proyecto guardado en archivo local.');

  
}

// This function resets the code and output divs, shows the
// generated code from the workspace, and evals the code.
// In a real application, you probably shouldn't use `eval`.
const runCode = () => {
  const code = javascriptGenerator.workspaceToCode(ws);
  codeDiv.innerText = code;

  outputDiv.innerHTML = '';

  eval(code);
};

// Load the initial state from storage and run the code.
load(ws);
runCode();

// Every time the workspace changes state, save the changes to storage.
ws.addChangeListener((e) => {
  // UI events are things like scrolling, zooming, etc.
  // No need to save after one of these.
  if (e.isUiEvent) return;
  save(ws);
});


// Whenever the workspace changes meaningfully, run the code again.
ws.addChangeListener((e) => {
  // Don't run the code when the workspace finishes loading; we're
  // already running it once when the application starts.
  // Don't run the code during drags; we might have invalid state.
  if (e.isUiEvent || e.type == Blockly.Events.FINISHED_LOADING ||
    ws.isDragging()) {
    return;
  }
  runCode();
});


