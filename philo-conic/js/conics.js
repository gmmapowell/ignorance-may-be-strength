function loadConics() {
  var dragStart;
  var top, bottom;

  PhiloGL('render3d',  {
    camera: {
      position: {
        x: 0, y: 0, z: -99
      }
    },
    textures: {
      src: ['img/balloons.png']
    },
    events: {
      onDragStart: function (e) {
        dragStart = { x: e.x, y: e.y }
      },
      onDragMove: function(e) {
        top.rotation.y += -(e.x - dragStart.x) / 100;
        top.rotation.x += -(e.y - dragStart.y) / 100;
        top.update();
        bottom.rotation.y += (e.x - dragStart.x) / 100;
        bottom.rotation.x += (e.y - dragStart.y) / 100;
        bottom.update();
        dragStart.x = e.x;
        dragStart.y = e.y;
      }
    },
    onError: function() {
      alert("There was an error creating the app.");
    },
    onLoad: function(app) {
      var gl = app.gl;
      top = cone(25, Math.PI);
      bottom = cone(-25, 0);

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

        PhiloGL.Fx.requestAnimationFrame(draw);
      }
    }
  });
}
