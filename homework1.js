"use strict";

var canvas;
var gl;

var numVertices  = 36;
var numChecks = 8;
var program;
var texture1,texture2
var c;
var flag = true;
var changeShading = true;
var textSize = 256;

var pointsArray = [];
var colorsArray = [];
var normalsArray = [];
var textCoordinatesArray=[];

var at, up, near,far,aspect,fovy,radius,theta,phi,eye,scale,x,y,z;

var lightPosition = vec4(2.0, 0.0, 0.0, 1.0 ); //change location
var lightAmbient = vec4(0.5, 0.4, 0.4, 0.4 );   //change color
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 ); //change diffusion
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 ); //change specular

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ambientColor, diffuseColor, specularColor;

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];


var image1 = new Uint8Array(4*textSize*textSize);

    for ( var i = 0; i < textSize; i++ ) {
        for ( var j = 0; j <textSize; j++ ) {
            var patchx = Math.floor(i/(textSize/numChecks));
            if(patchx%2) c = 255;
            else c = 0;
            image1[4*i*textSize+4*j] = c;
            image1[4*i*textSize+4*j+1] = c;
            image1[4*i*textSize+4*j+2] = c;
            image1[4*i*textSize+4*j+3] = 255;
        }
    }

var image2 = new Uint8Array(4*textSize*textSize);

    // Create a checkerboard pattern
    for ( var i = 0; i < textSize; i++ ) {
        for ( var j = 0; j <textSize; j++ ) {
            var patchy = Math.floor(j/(textSize/numChecks));
            if(patchy%2) c = 255;
            else c = 0;
            image2[4*i*textSize+4*j] = c;
            image2[4*i*textSize+4*j+1] = c;
            image2[4*i*textSize+4*j+2] = c;
            image2[4*i*textSize+4*j+3] = 255;
           }
    }
// var image 2 = new Image(); image.onload = function() {
//     configureTexture( image ); }
//     image.src = "f1.png”
// var image = document.getElementById("texImage”)
// window.onload = configureTexture( image );
function configureTexture() {
    texture1 = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textSize, textSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image1);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    texture2 = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textSize, textSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image2);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}
function quad(a, b, c, d) {
     var tex1 = subtract(vertices[b], vertices[a]);
     var tex2 = subtract(vertices[c], vertices[b]);
     var normal = vec3(cross(tex1, tex2));
     normal = normalize(normal);

     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     normalsArray.push(normal);
     textCoordinatesArray.push(texCoord[0]);

     pointsArray.push(vertices[b]);
     colorsArray.push(vertexColors[a]);
     normalsArray.push(normal);
     textCoordinatesArray.push(texCoord[1]);

     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     normalsArray.push(normal);
     textCoordinatesArray.push(texCoord[2]);

     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     normalsArray.push(normal);
     textCoordinatesArray.push(texCoord[0]);

     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     normalsArray.push(normal);
     textCoordinatesArray.push(texCoord[2]);

     pointsArray.push(vertices[d]);
     colorsArray.push(vertexColors[a]);
     normalsArray.push(normal);
     textCoordinatesArray.push(texCoord[3]);
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    colorCube();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var bBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.enableVertexAttribArray( vTexCoord );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(textCoordinatesArray), gl.STATIC_DRAW );

    configureTexture(image2);

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.uniform1i(gl.getUniformLocation( program, "Text0"), 0);

    gl.activeTexture( gl.TEXTURE1 );
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.uniform1i(gl.getUniformLocation( program, "Text1"), 1);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

   gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
       flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
       flatten(lightPosition) );

    gl.uniform1f(gl.getUniformLocation(program,
       "shininess"),materialShininess);

    far = document.getElementById("FarSlider")
    near = document.getElementById("NearSlider")
    radius = document.getElementById("radiusSlider")
    theta = document.getElementById("thetaSlider")
    phi = document.getElementById("phiSlider")
    fovy = document.getElementById("fovSlider")
    aspect = document.getElementById("aspectSlider")

    scale = document.getElementById("scaleSlider");
    x = document.getElementById("XSlider");
    y = document.getElementById("YSlider");
    z = document.getElementById("ZSlider");

    document.getElementById("ShadingSwitchButton").onchange = function(event) {
        PhongGourandShadingModelChange = !PhongGourandShadingModelChange;
    };
    render();

}

function resetButton(){

    document.getElementById("radiusSlider").value=5
    document.getElementById("thetaSlider").value=360
    document.getElementById("phiSlider").value=0
    document.getElementById("FarSlider").value=10
    document.getElementById("NearSlider").value=2

    document.getElementById("fovSlider").value=40
    document.getElementById("aspectSlider").value=1
    document.getElementById("scaleSlider").value=1

    document.getElementById("XSlider").value=0
    document.getElementById("YSlider").value=0
    document.getElementById("ZSlider").value=0

}

var render = function() {
     gl.uniform1f(gl.getUniformLocation(program, "changeShading"),changeShading);

function ScreenRendering(drawX, drawY, drawWidth, drawHeight, projectionMatrix){
    gl.viewport(drawX, drawY, drawWidth, drawHeight);
    gl.scissor(drawX, drawY, drawWidth, drawHeight);
    gl.enable(gl.SCISSOR_TEST);
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    gl.enable(gl.DEPTH_TEST);

    const r = radius.value
    const sinTheta =  Math.sin(theta.value* Math.PI / 360);
    const sinPhi =  Math.sin(phi.value* Math.PI / 360);
    const cosTheta =  Math.cos(theta.value* Math.PI / 360);
    const cosPhi =  Math.cos(phi.value* Math.PI / 360);
    eye = vec3(r * sinTheta * cosPhi,
               r * sinPhi,
               r * cosTheta * cosTheta);

    at = vec3(0.0, 0.0, 0.0);
    up = vec3(0.0, 1.0, 0.0);

    let modelViewMatrix = lookAt(eye, at, up);

    modelViewMatrix = mult(modelViewMatrix, translate(x.value, y.value, z.value));
    modelViewMatrix = mult(modelViewMatrix, scalem(scale.value, scale.value, scale.value));

    let modelViewMatrixLoc= gl.getUniformLocation(program,"modelViewMatrix");
    let projectionMatrixLoc= gl.getUniformLocation(program,"projectionMatrix");
    let reverseMatrixModel=inverse(modelViewMatrix);
    let translationMatrixModel=transpose(modelViewMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false,flatten(reverseMatrixModel));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false,flatten(translationMatrixModel));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false,flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false,flatten(projectionMatrix));

    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
}
    var width = gl.canvas.width;
    var height = gl.canvas.height;
    var displayWidth = gl.canvas.clientWidth;
    var displayHeight = gl.canvas.clientHeight;
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
    {
    let projectionMatrix = perspective(fovy.value, aspect.value, -near.value/2, far.value)
    ScreenRendering(0, 0, width/2 , height, projectionMatrix);
    }
    {
    let top = 1.6;
    let bottom = -1.6;
    let right = top * aspect.value;
    let left = -right;
    let projectionMatrix = ortho(left,right,bottom,top, -near.value/2,far.value)
    ScreenRendering(width/2, 0, width/2, height, projectionMatrix);
    }
    requestAnimFrame(render);
}
