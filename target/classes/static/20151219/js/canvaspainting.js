//canvas1.on("mouse:down", getMouseCoords);
//function getMouseCoords(event)
//{
//  var pointer = canvas1.getPointer(event.e);
//  var posX = pointer.x;
//  var posY = pointer.y;
//  console.log("Start: " + posX+", "+posY);    // Log to console
//}

//canvas1.on("object:modified", function(options) {
//    alert("Object modified fired:" + options);
//});            
//
//canvas1.on("path:created", function(options) {
//    alert("Path created:" + options);
//});            


// Start point (x,y)
var x1,y1;
// End point (x,y)
var x2,y2;

var canvas0 = $('#canvas0');
canvas0.isDrawingMode = false;

// Create canvas1
var canvas1 = $('#canvas1');
canvas1.isDrawingMode = false;

// Create canvas2
var canvas2 = $('#canvas2');
canvas2.isDrawingMode = false;


// Create a pointer
var arrowImg = document.getElementById('arrow');
var pointer;
pointer = new fabric.Image(arrowImg, {
    lockRotation: true,
    lockScalingX: true,
    lockScalingY: true
});
// Remove resizing handles
pointer.setControlsVisibility({
    bl: false,
    br: false,
    mb: false,
    ml: false,
    mr: false,
    mt: false,
    tl: false,
    tr: false,
    mtr: false
});



function sendToQueue(shape){
    var type = shape.type;
    var json = JSON.stringify(shape);
    receiveFromQueue(type, json);
}

function receiveFromQueue(type, json) {
    var shape;
    if (type == "mouseMove") {
        pointer.bringToFront();
        pointer.set(JSON.parse(json));
        canvas2.renderAll();
    } else {
        switch (type) {
            case 'rect':
                shape = new fabric.Rect(JSON.parse(json));
                break;
            case 'circle':
                shape = new fabric.Circle(JSON.parse(json));
                break;
            case 'triangle':
                shape = new fabric.Triangle(JSON.parse(json));
                break;
            case 'text':
                shape = new fabric.Text("",JSON.parse(json));
                break;
        }
        shape.selectable = false; // seems to get lost??
        canvas0.add(shape);
        //canvas2.add(shape);
    }
}


//var text  = new fabric.Text('hello world', { left: 100, top: 100 });
//var json  = JSON.stringify(text);
//console.log(json);
//var shape = new fabric.Text("", JSON.parse(json));
//canvas1.add(shape);


function getMethods(obj) {
    var res = [];
    for(var m in obj) {
        if(typeof obj[m] == "function") {
            res.push(m)
            if ("get" == m.substring(0, 3)){ 
                console.log(m);
            }
        }
    }
    return res;
}

canvas2.add(pointer); 
var activeTool = "rect";
disableSelection()

$(".tool").on("click", function() {
    // if click was not the active tool!
    if (this.id != activeTool) {
        $(".tool").css("color", "#000000"); // rework these!!!
        $(".tool").removeClass("activeTool");
        $("#" + this.id).addClass("activeTool");
        $(".activeTool").css("color", $(".activeColor").css("color"));
        // Deactivate!
        switch (activeTool) {
            case 'rect':
                break;
            case 'circle':
                break;
            case 'triangle':
                break;
            case 'text':
                break;
//            case 'pencil':
//                canvas1.isDrawingMode = false;
//                break;
            case 'pointer':
                disableSelection();
                break;
        }
        // Activate!
        switch (this.id) {
            case 'rect':
                break;
            case 'circle':
                break;
            case 'triangle':
                break;
            case 'text':
                break;
//            case 'pencil':
//                canvas1.isDrawingMode = true;
//                break;
            case 'pointer':
                enableSelection();
                break;
        }
        activeTool = this.id;
    }
});

var activeColor = "red";
$(".color").on("click", function() {
    if (this.id != activeColor) {
        $(".color").removeClass("activeColor");
        $("#" + this.id).addClass("activeColor");
        activeColor=this.id;
        $(".activeTool").css("color", $(".activeColor").css("color"));
    }
});
$(".activeTool").css("color", $(".activeColor").css("color"));



$("#textStrokeWidth").change(function() {
    $("#textStrokeWidthValue").html($("#textStrokeWidth").val());
});
$("#textFontSize").change(function() {
    $("#textFontSizeValue").html($("#textFontSize").val());
});
$("#textLineHeight").change(function() {
    $("#textLineHeightValue").html($("#textLineHeight").val());
});

function disableSelection() {
    //canvas1.selection = false;
    canvas1.forEachObject(function(o) {
      o.selectable = false;
    });
    canvas1.deactivateAll().renderAll();
}

function enableSelection() {
    canvas1.selection = true;    
    canvas1.forEachObject(function(o) {
      o.selectable = true;
    });
}

//canvas2.add(pointer);   





/*******************************************************************************
 * Event Listeners: https://github.com/kangax/fabric.js/wiki/Working-with-events
 *******************************************************************************/
// General Events
canvas0.on("after:render",   afterRender);
canvas0.on("before:render",  beforeRender);
canvas0.on("canvas:cleared", canvasCleared);

// Mouve Related Events
canvas0.on("mouse:down",     mouseDown);
canvas0.on("mouse:up",       mouseUp);            
canvas0.on("mouse:move",     mouseMove);
canvas0.on("mouse:out",      mouseOut);
canvas0.on("mouse:over",     mouseOver);

// Object Related Events
canvas0.on("object:added",   objectAdded);
canvas0.on("object:modified",objectModified);
canvas0.on("object:moving",  objectMoving);
canvas0.on("object:over",    objectOver);
canvas0.on("object:out",     objectOut);
canvas0.on("object:removed", objectRemoved);
canvas0.on("object:rotating",objectRotating);
canvas0.on("object:scaling", objectScaling);
canvas0.on("object:selected",objectSelected);

// Path Related Events
canvas0.on("path:created",pathCreated);

// Selections Related Events
canvas0.on("before:selection:cleared",beforeSelectionCleared);
canvas0.on("selection:cleared",selectionCleared);
canvas0.on("selection:created",selectionCreated);

/*******************************************************************************
 * Event Handlers:
 *******************************************************************************/
// General Events
function afterRender(event) {
}
function beforeRender(event) {
}
function canvasCleared(event) {
}

// Mouse Events
function mouseDown(event) {
    var pointer = this.getPointer(event.e);
    x1 = pointer.x;
    y1 = pointer.y;
}            

function mouseUp(event) {
    var pointer = this.getPointer(event.e);
    x2 = pointer.x;
    y2 = pointer.y;
    var shape
    //var color = $(".activeColor").css("color");

    //var textStrokeWidth = $("#textStrokeWidth").val();
    //var textFontSize = $("#textFontSize").val();
    //var textLineHeight = $("#textFontSize").val();

    var color = "red";
    var textStrokeWidth = 2;
    var textFontSize = 13;
    var testLineHeight = 1;
    
    switch (activeTool) {
        case 'rect':
            shape = new fabric.Rect({
              left: x1,
              top:  y1,
              fill: 'red',
              width: x2 - x1,
              height: y2 - x1,
              selectable: false,
              fill: color
            });
            break;
        case 'circle':
            //var d = Math.sqrt(Math.pow((x2-x1),2) + Math.pow((y2-y1),2)); // Pythagorean Theorem
            var d = Math.min((x2-x1),(y2-y1)); // the lesser of x and y deltas.
            shape = new fabric.Circle({ 
                radius: d/2, 
                fill: '#f55', 
                left: x1,
                top: y1,
                selectable: false,
                fill: color                
            });
            break;
        case 'triangle':
            shape = new fabric.Triangle({
              left: x1,
              top:  y1,
              fill: 'red',
              width: x2 - x1,
              height: y2 - x1,
              selectable: false,
              fill: color              
            });
            break;
        case 'text':
            var text = prompt('Enter Text');
            var textStrokeWidth = $("#textStrokeWidth").val();
            var textFontSize    = $("#textFontSize").val();
            var textLineHeight  = $("#textLineHeight").val();
             shape = new fabric.Text(text, { 
                 left: x1, 
                 top: y1,
                 stroke: textStrokeWidth,
                 fontSize:   textFontSize,
                 lineHeight: textLineHeight
             });
            break;
    }
    sendToQueue(shape);
}            
function mouseMove(event) {
    var shape = {type: "mouseMove", left: event.e.layerX-5, top: event.e.layerY-5 };  
    sendToQueue(shape);
}            
function mouseOut(event) {
}            
function mouseOver(event) {
}            

// Object Events
function objectAdded(event) {
}            
function objectModified(event) {
}            
function objectMoving(event) {
    var activeObject = event.target;
//    console.log(activeObject.get('left'), activeObject.get('top'));
}            
function objectOver(event) {
}            
function objectOut(event) {
}            
function objectRemoved(event) {
}            
function objectRotating(event) {
}            
function objectScaling(event) {
}            
function objectSelected(event) {
    var test = event.target.get('type');
    var test2 = test;
}            

// Path Events
function pathCreated(event) {
}

// Selections Events
function beforeSelectionCleared(event) {
}
function selectionCleared(event) {
}
function selectionCreated(event) {
}



