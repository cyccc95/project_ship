import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import Detail from '../../components/map/Detail';
import moment from 'moment';

const { kakao } = window;
let markers = []; // 마커를 저장할 배열

const DetailStyle = styled.div`
  position: absolute;
  top: 10px;
  right: 170px;
  z-index: 5;
  width: 80px;
  border-radius: 10%;
  background-color: rgb(0, 24, 107);
  color: white;
`;

// 특정 mmsi 선박의 최신 ais 데이터 요청
const getShip = (setShip, mmsi) => {
  axios
    .get('/api/ship/mmsi/' + mmsi)
    .then((response) => {
      setShip(response.data);
    })
    .catch((error) => console.log(error));
};

const Ship = () => {
  const [ship, setShip] = useState({});
  const [kakaoMap, setKakaoMap] = useState(null);

  const { mmsi } = useParams();
  const location = useLocation();
  const { posX, posY } = location.state;

  // 마커 이미지
  const cargoImage = 'https://cdn-icons-png.flaticon.com/512/9565/9565467.png'; // 화물선
  const tankerImage = 'https://cdn-icons-png.flaticon.com/512/2942/2942056.png'; // 유조선
  const lossImage = 'https://cdn-icons-png.flaticon.com/512/3967/3967841.png'; // 신호 소실 선박

  useEffect(() => {
    // 최초 한번 지도 랜더링
    kakao.maps.load(() => {
      const mapContainer = document.getElementById('map');
      const mapOptions = {
        center: new kakao.maps.LatLng(posY, posX),
        level: 10,
      };
      const map = new kakao.maps.Map(mapContainer, mapOptions);

      setKakaoMap(map);
    });
  }, []);

  useEffect(() => {
    // 최초 실행시 요청
    getShip(setShip, mmsi);

    // 10초마다 지속적으로 요청
    const timer = setInterval(() => {
      getShip(setShip, mmsi);
    }, 10000);

    return () => clearInterval(timer);
  }, [mmsi]);

  useEffect(() => {
    if (kakaoMap === null) {
      return;
    }

    // 마커를 표시할 위치 객체
    let markerPosition = new kakao.maps.LatLng(ship.posY, ship.posX);

    // 마커 이미지 크기
    const imageSize = new kakao.maps.Size(24, 30);

    // 마커 초기화
    for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    markers.length = 0;

    // 현재 시간을 담은 변수 생성하고 선박의 signal_date 가져옴
    let currentTime = moment();
    let shipSignalTime = moment();
    ship.aisKey &&
      (shipSignalTime = moment(ship.aisKey.signal_date)
        .subtract(9, 'hour')
        .format('YYYY-MM-DD HH:mm:ss'));

    // 현재 시간과 마지막 신호 시간의 차이를 계산하여 소실 신호라 판단되면 예측하도록 요청
    // 신호가 소실되지 않았거나 소실되었다가 다시 정상 신호가 들어오면 예측했던 데이터 삭제 요청
    moment.duration(currentTime.diff(shipSignalTime)).asMinutes() >= 5
      ? ship.aisKey &&
        moment.duration(currentTime.diff(shipSignalTime)).asMinutes() <= 30 &&
        axios
          .post('/api/predict/ship/' + ship.aisKey.ship.mmsi)
          .then((response) => {})
          .catch((error) => console.log(error))
      : ship.aisKey &&
        axios
          .delete('/api/predict/ship/' + ship.aisKey.ship.mmsi)
          .then((response) => {})
          .catch((error) => console.log(error));

    // 신호 소실 유무별, 선박 타입별 마커 이미지 생성
    let markerImage;
    ship && moment.duration(currentTime.diff(shipSignalTime)).asMinutes() >= 5
      ? (markerImage = new kakao.maps.MarkerImage(lossImage, imageSize))
      : ship.aisKey && ship.aisKey.ship.shipType === 70
      ? (markerImage = new kakao.maps.MarkerImage(cargoImage, imageSize))
      : (markerImage = new kakao.maps.MarkerImage(tankerImage, imageSize));

    // 마커 생성
    let marker = new kakao.maps.Marker({
      map: kakaoMap, // 마커를 표시할 지도
      position: markerPosition, // 마커를 표시할 위치
      image: markerImage, // 마커 이미지
    });

    // 생성한 마커를 markers에 저장
    markers.push(marker);
  }, [ship]);

  return (
    <>
      <div
        id="map"
        style={{
          width: '100vw',
          height: '100vh',
        }}
      ></div>

      <DetailStyle>
        <Detail ship={ship} />
      </DetailStyle>
    </>
  );
};

export default Ship;
