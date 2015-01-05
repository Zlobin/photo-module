(function(global, $, fabric, FileAPI, saveAs) {
  'use strict';

  $(function() {
    var UserImg = {
      crop: null,
      full: null
    };
    var UserAvatar;
    var CropCoords = {
      lx: 0,
      ly: 0,
      lw: 0,
      lh: 0
    };
    var external = false;
    var ExtImg = null;
    var ExtCanvas = null;

    var colors = {
      yellow: '#fffb9a',
      orange: '#ffa418',
      green: '#a1f693',
      blue: '#b5cbff'
    };

    var FilterApi = function(id) {
      var canvas = new fabric.Canvas(id);
      var f = fabric.Image.filters;
      var canvasColor;
      var callback = $.noop();

      return {
        addColor: function(color) {
          canvasColor = color;

          return this;
        },
        setCallback: function(cbk) {
          callback = cbk;
          return this;
        },
        setCanvas: function(imgSrc) {
          canvas.deactivateAll();
          fabric.Image.fromURL(imgSrc, function(img) {
            if (canvasColor === colors.blue) {
              img.filters.push(new f.Grayscale());
            } else {
              img.filters.push(new f.Sepia2());
            }

            img.filters.push(new f.Tint({
              color: canvasColor,
              opacity: 0.3
            }));
            img.filters.push(new f.Multiply({
              color: canvasColor
            }));
            img.applyFilters(function() {
              canvas.renderAll.bind(canvas);
              global.setTimeout(function() {
                callback(canvas.toDataURL());            
              }, 10);
            });
            canvas.add(img);
          });

          return this;
        }
      };
    };

    var Popup = (function() {
      return {
        show: function(popup) {
          $('<div/>', {
            'class': 'shadow'
          }).prependTo('body');

          $('.shadow').on('click', function () {
            Popup.hide();
          });

          $('.my-popup').hide();
          $('.' + popup).show('scale');
        },
        hide: function() {
          $('.shadow').remove();
          $('.my-popup').hide('scale');
        }
      };
    })();

    var Step = (function() {
      var $wrapper = $('.page.packs');
      var $step1 = $('.steps.step-one');
      var $step2 = $('.steps.step-two');
      var $step3 = $('.steps.step-three');
      var $stepsBottom = $('.steps-bottom');

      var step1 = function() {
        $wrapper
          .removeClass('step2 step3')
          .addClass('step1');

        $step2.hide();
        $step1.show();
        $stepsBottom.show();
        $step1.find('.photo-bg').css('background-image', 'url()');
        $step1.find('.user-border').hide();
        $step1.find('.photo-bg').hide();

        $step2.find('.color-selector').hide();

        $step1.find('.no-select').show();
        $step1.find('.photo-selector').show();
        $step1.removeClass('two');
      };
      var step2 = function() {
        if (UserImg.full === null) {
          global.alert('Необходимо загрузить фотографию');
        } else {
          $wrapper
            .removeClass('step3 step1')
            .addClass('step2');

          $step2.find('.color-selector').show();

          $step3.hide();
          $step1.hide();
          $step2.show();

          setColor(1);        
        }
      };
      var step3 = function() {
        CombineImages($('#imgLeft')[0], $('#imgRight')[0], function($canvas) {
          ExtCanvas = $canvas;
          UserAvatar = ExtCanvas[0].toDataURL();
          $('.step-three').find('.user-avatar')[0].src = UserAvatar;

          $wrapper
            .removeClass('step1 step2')
            .addClass('step3');

          $step2.find('.color-selector').hide();

          $step2.hide();
          $step3.show();
        });
      };

      return {
        show: function(step) {
          switch (step) {
            case 'step1':
              step1();
              break;
            case 'step2':
              step2();
              break;
            case 'step3':
              step3();
              break;
            default:
              break;
          }
        }
      };
    })();

    var CombineImages = function(img1, img2, callback) {
      var $canvas = $('<canvas/>');
      var ctx = $canvas[0].getContext('2d');
      var img = new Image();
      var border = '/img/round_.png';

      $canvas[0].width = 264;
      $canvas[0].height = 264;
      ctx.drawImage(img1, 0, 0);
      ctx.drawImage(img2, 132, 0);

      img.onload = function () {
        ctx.drawImage(img, 5, 5);
        callback($canvas);
      };
      img.src = border;
    };

    var colorSelector = {
      1: {
        first: colors.yellow,
        second: colors.green
      },
      2: {
        first: colors.orange,
        second: colors.yellow
      },
      3: {
        first: colors.blue,
        second: colors.orange
      },
      4: {
        first: colors.green,
        second: colors.blue
      },
      5: {
        first: colors.green,
        second: colors.orange
      }
    };

    var setColor = function(color) {
      var colors = colorSelector[color];
      var canvasLeft = new FilterApi('canvasLeft');
      var canvasRight = new FilterApi('canvasRight');
      var $imgLeft = $('#imgLeft');
      var $imgRight = $('#imgRight');

      canvasLeft
        .addColor(colors.first)
        .setCallback(function(img) {
          $imgLeft[0].src = img;
        })
        .setCanvas(UserImg.crop);

      canvasRight
        .addColor(colors.second)
        .setCallback(function(img) {
          $imgRight[0].src = img;
        })
        .setCanvas(UserImg.crop);
    };

    function cloneCanvas(oldCanvas) {
      var newCanvas = global.document.createElement('canvas');
      var context = newCanvas.getContext('2d');

      newCanvas.width = oldCanvas.width;
      newCanvas.height = oldCanvas.height;

      context.drawImage(oldCanvas, 0, 0);

      return newCanvas;
    }
    
    var Cadr = function(file) {
      Popup.show('cadr-popup');

      $('.js-img').cropper({
        file: file,
        bgColor: '#fff',
        maxSize: [310, 264],
        minSize: [32, 64],
        setSelect: [0, 0, 10, 10],
        onSelect: function (coords) {
          $('#userpic').fileapi('crop', file, coords);
          $('.js-img-result').empty();

          $('.js-preview')
            .clone()
            .appendTo('.js-img-result');

          CropCoords = coords;

          global.setTimeout(function() {
            var oldCanvas = $('#userpic .js-preview').find('canvas');
            var newCanvas = $('.js-img-result').find('canvas');

            if (oldCanvas.length > 0 && newCanvas.length > 0) {
              newCanvas.parent().html(cloneCanvas(oldCanvas[0]));
            }
          }, 10);
        }
      });

      global.setTimeout(function() {
        var oldCanvas = $('#userpic .js-preview').find('canvas');
        var newCanvas = $('.js-img-result').find('div').last();

        if (oldCanvas.length > 0) {
          newCanvas.html(cloneCanvas(oldCanvas[0]));
        }
      }, 500);
    };

    var CropExternal = function(dataURL, callback) {
      FileAPI.Image(dataURL)
        .resize(310, 264, 'max')
        .get(function (err, img) {

          FileAPI.Image(img.toDataURL())
            .crop(CropCoords.lx, CropCoords.ly, CropCoords.lw, CropCoords.lh)
            .get(function (err, img) {
              FileAPI.Image(img.toDataURL())
                .resize(132, 264)
                .get(function(err, img2) {
                  callback(img2);
                });
            });
        });
    };

    var CadrExternal = function($img) {
      Popup.show('cadr-popup');
      ExtImg = $img;

      $('.js-img').cropper({
        file: $img[0].src,
        bgColor: '#fff',
        maxSize: [310, 264],
        minSize: [32, 64],
        setSelect: [0, 0, 10, 10],
        onSelect: function (coords) {
          CropCoords = coords;
          CropExternal($img[0].src, function(img) {
            $('.js-img-result').html(img);
          });
        }
      });
    };

    $('#userpic').fileapi({
      url: './ctrl.php',
      autoUpload: false,
      accept: 'image/*',
      multiple: false,
      maxSize: FileAPI.MB * 10,
      elements: {
        preview: {
          el: '.js-preview',
          width: 132,
          height: 264
        },
        dnd: {
          el: '.b-upload__dnd'
        }
      },
      onDrop: function (evt, ui) {
        external = false;
        Cadr(ui.files[0]);
      },
      onSelect: function (evt, ui) {
        external = false;
        Cadr(ui.files[0]);
      }
    });

    $('.load-device').on('click', function() {
      $('#userpic .js-browse input').trigger('click');
    });

    $('.gostep').on('click', function () {
      var step = $(this).data('step');

      Step.show('step' + step);
    });

    $('.show-popup').on('click', function () {
      var popup = $(this).data('popup');

      Popup.show(popup);
    });

    $('.hide-popup').on('click', function () {
      Popup.hide();
    });

    $('.cadr-popup').find('.save').on('click', function() {
      var canvasCrop = $('.js-img-result').find('canvas')[0];
      var dataURLCrop;

      if (external) {
        dataURLCrop = ExtImg[0].src;

        UserImg.crop = $('.js-img-result canvas')[0].toDataURL();
        UserImg.full = dataURLCrop;

        Popup.hide();
        $('.step-one').find('.next').trigger('click');
      } else if (canvasCrop) {
        dataURLCrop = canvasCrop.toDataURL();

        FileAPI.Image(dataURLCrop)
          .resize(310, 264, 'max')
          .get(function (err, img) {
            FileAPI.Image(img.toDataURL())
              .crop(CropCoords.lx, CropCoords.ly, CropCoords.lw, CropCoords.lh)
              .get(function (err, img) {
                UserImg.full = dataURLCrop;

                FileAPI.Image(img.toDataURL())
                  .resize(132, 264)
                  .get(function(err, img2) {
                    UserImg.crop = img2.toDataURL();
                    Popup.hide();
                    $('.step-one').find('.next').trigger('click');
                  });
              });
          });
      } else {
        global.alert('Выберите область фотографии');
      }
    });

    $('.prev-color').on('click', function() {
      var colorId = parseInt($('.color-bg').data('id'), 10);
      var prevColor = colorId - 1;
      
      if (colorId === 1) {
         prevColor = 5;
      }
      
      $('.color-bg').data('id', prevColor);
      $('.color-bg').removeClass('color-1 color-2 color-4 color-5 color-3').addClass('color-' + prevColor);
      setColor(prevColor);
    });

    $('.next-color').on('click', function() {
      var colorId = parseInt($('.color-bg').data('id'), 10);
      var nextColor = colorId + 1;
      
      if (colorId === 5) {
         nextColor = 1;
      }

      $('.color-bg').data('id', nextColor);
      $('.color-bg').removeClass('color-1 color-2 color-4 color-5 color-3').addClass('color-' + nextColor);
      setColor(nextColor);
    });

    $('.step-three').find('.print').on('click', function() {
      var win = global.open();
      var $img = $('.step-three').find('.user-avatar');

      win.document.body.innerHTML= '<img src="' + $img[0].src + '" />';
      win.print();
      win.document.close();
    });

    $('#set-url').on('submit', function(e) {
      e.preventDefault();
      var url = $(this).find('.set-url').val();

      if (url !== '') {
        $.post('/url.php', {saveUrl: url}, function(data) {
          var ImageAPI = FileAPI.Image(data);
          ImageAPI.rotate(0).get(function (err, img) {
            var imgLoad = new Image();
            imgLoad.onload = function() {
              external = true;
              CadrExternal($(imgLoad));
            };
            imgLoad.src = img.toDataURL();
          });
        });
      }

      return false;
    });

    $('.step-three').find('.save').on('click', function() {
      ExtCanvas[0].toBlob(function(blob) {
        saveAs(blob, 'test_file.png');
      });
    });

    $('.buttons div').on('mouseover mouseout', function(event) {
      var $el = $(this);

      if (event.type === 'mouseover') {
        $el.parent().css('right', '-250px');
        $el.width('100px');
      } else {
        $el.parent().css('right', '-150px');
        $el.width(0);
      }
    });
  });

})(this, this.jQuery, this.fabric, this.FileAPI, this.saveAs);
