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
        rot(top, e, -1, -1);
        rot(bottom, e, 1, 1);
        dragStart.x = e.x;
        dragStart.y = e.y;

        function rot(comp, e, sgnx, sgny) {
          comp.rotation.y += sgnx * (e.x - dragStart.x) / 100;
          comp.rotation.x += sgny * (e.y - dragStart.y) / 100;

          var m = comp.matrix;
          m.id();
          m.$rotateXYZ(comp.rotation.x, comp.rotation.y, comp.rotation.z);
          m.$translate(comp.position.x, sgny*comp.position.y, comp.position.z);
          m.$scale(comp.scale.x, comp.scale.y, comp.scale.z);
        }
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
