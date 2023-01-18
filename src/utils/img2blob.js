const fetchImage = async (imageUrl) => {
  return fetch(imageUrl)
    .then((response) => response.blob())
    .then((imageBlob) => {
      const imageObjectURL = URL.createObjectURL(imageBlob);
      return imageObjectURL;
    });
};

export { fetchImage };
