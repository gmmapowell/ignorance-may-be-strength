function loadConics() {

  PhiloGL('render3d',  {
    camera: {
      position: {
        x: 0, y: 0, z: -99
      }
    },
    textures: {
      src: ['img/balloons.png']
    },
    onError: function() {
      alert("There was an error creating the app.");
    },
    onLoad: function(app) {
      var gl = app.gl;
      var top = cone(25, Math.PI);
      var bottom = cone(-25, 0);

      app.scene.add(top);
      app.scene.add(bottom);

      draw();

      function cone(yd, rot) {
        var ret = new PhiloGL.O3D.Cone({
          radius: 20,
          height: 50,
          nradial: 20,
          textures: ['img/balloons.png']
        });
        ret.position.y = yd;
        ret.rotation.set(0, 0, rot);
        ret.update();
        return ret;
      }

      function draw() {
        gl.viewport(0, 0, app.canvas.width, app.canvas.height);
        gl.clearColor(0.7, 0.7, 0.7, 1);
        gl.clearDepth(1);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        app.scene.render();
      }
    }
  });
}
