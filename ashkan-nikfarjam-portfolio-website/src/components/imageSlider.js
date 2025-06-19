import React, { useState } from 'react';
import './styling/ImageSlider.css'; 

const ImageSlider = ({ images }) => {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((index + 1) % images.length);
  const prev = () => setIndex((index - 1 + images.length) % images.length);

  return (
    <div className="slider">
      <button onClick={prev}>‹</button>
      <img src={images[index]} alt={`Slide ${index + 1}`} className="slider-img" />
      <button onClick={next}>›</button>
    </div>
  );
};

export default ImageSlider;