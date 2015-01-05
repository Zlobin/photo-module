<?php
  error_reporting(0);

  if (isset($_POST['saveUrl']) && !empty($_POST['saveUrl'])) {
    function imagecreatefromfile( $filename ) {
      switch (strtolower(pathinfo( $filename, PATHINFO_EXTENSION ))) {
        case 'jpeg':
        case 'jpg':
          return imagecreatefromjpeg($filename);
        break;

        case 'png':
          return imagecreatefrompng($filename);
        break;

        case 'gif':
          return imagecreatefromgif($filename);
        break;

        default:
          throw new InvalidArgumentException('File "' . $filename . '" is not valid jpg, png or gif image.');
        break;
      }
    }
    
    function output($filename, $img) {
      switch (strtolower(pathinfo( $filename, PATHINFO_EXTENSION ))) {
        case 'jpeg':
        case 'jpg':
          return imagejpeg($img);
        break;

        case 'png':
          return imagepng($img);
        break;

        case 'gif':
          return imagegif($img);
        break;

        default:
          throw new InvalidArgumentException('File "' . $filename . '" is not valid jpg, png or gif image.');
        break;
      }
    }
    
    $img = imagecreatefromfile($_POST['saveUrl']);

    ob_start();
    output($_POST['saveUrl'], $img);
    imagedestroy($img);
    $contents = ob_get_clean();

    echo "data:image/jpeg;base64," . base64_encode($contents);
  }

  exit;
