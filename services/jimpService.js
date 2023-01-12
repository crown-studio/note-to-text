const cropImage = async (pathToImage, callback) => {
  const image = await Jimp.read(pathToImage);
  image.crop(20, 20, 100, 100, function(err){
    if (err) throw err;
    callback()
  })
  .write('crop2.png');
}

module.exports {
  cropImage,
  // splitImage
}