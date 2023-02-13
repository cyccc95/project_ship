import React from 'react';
import styled from 'styled-components';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

const FilterStyle = styled.div`
  height: 33vh;
`;

const CardStyle = {
  width: '15rem',
  backgroundColor: 'rgb(0, 24, 107)',
};

const CardTitleStyle = {
  textAlign: 'center',
  fontSize: '25px',
  fontWeight: 'bold',
};

const CardTextStyle = {
  padding: '10px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const ButtonStyle = { margin: '10px', width: '80%' };

const ImageStyle = { width: '25px', height: '25px' };

const Filter = () => {
  const navigate = useNavigate();

  const shipTypeAll = () => {
    navigate('/');
  };

  const shipTypeCargo = () => {
    navigate('/ships/cargo');
  };

  const shipTypeTanker = () => {
    navigate('/ships/tanker');
  };

  const shipTypeLoss = () => {
    navigate('/ships/loss');
  };

  return (
    <FilterStyle>
      <Card style={CardStyle}>
        <Card.Body>
          <Card.Title style={CardTitleStyle}>필터</Card.Title>
          <Card.Text style={CardTextStyle}>
            <Button variant="primary" style={ButtonStyle} onClick={shipTypeAll}>
              전체
            </Button>
            <Button
              variant="primary"
              style={ButtonStyle}
              onClick={shipTypeTanker}
            >
              유조선&nbsp;&nbsp;
              <img
                src="https://cdn-icons-png.flaticon.com/512/2942/2942056.png"
                style={ImageStyle}
                alt="유조선"
              ></img>
            </Button>
            <Button
              variant="primary"
              style={ButtonStyle}
              onClick={shipTypeCargo}
            >
              화물선&nbsp;&nbsp;
              <img
                src="https://cdn-icons-png.flaticon.com/512/9565/9565467.png"
                style={ImageStyle}
                alt="화물선"
              ></img>
            </Button>
            <Button
              variant="primary"
              style={ButtonStyle}
              onClick={shipTypeLoss}
            >
              신호 소실&nbsp;&nbsp;
              <img
                src="https://cdn-icons-png.flaticon.com/512/3967/3967841.png"
                style={ImageStyle}
                alt="화물선"
              ></img>
            </Button>
          </Card.Text>
        </Card.Body>
      </Card>
    </FilterStyle>
  );
};

export default Filter;
