import React from 'react';
import styled from 'styled-components';

const TitleStyle = styled.div`
  height: 15vh;
  text-align: center;
  font-size: 40px;
  padding-top: 10px;
`;

const Title = () => {
  return (
    <TitleStyle>
      선박 위치
      <br />
      예측 서비스
    </TitleStyle>
  );
};

export default Title;
