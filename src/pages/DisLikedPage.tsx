import React from 'react';
import PropertyPage from '../components/PropertyPage';

const DisLikedPage: React.FC = () => {
  return (
    <PropertyPage status="disliked" theme="red" title="Disliked Properties" />
  );
};

export default DisLikedPage;
