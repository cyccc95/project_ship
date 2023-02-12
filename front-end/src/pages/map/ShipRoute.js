import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import DetailRoute from '../../components/map/DetailRoute';
import moment from 'moment';

const { kakao } = window;
let markers = []; // 마커를 저장할 배열
let infowindows = []; // 인포윈도우를 저장할 배열
let predictedMarkers = []; // 예측 마커를 저장할 배열
let predictedInfowindows = []; // 예측 인포윈도우를 저장할 배열
let greenLinePath = []; // 정상 신호 위치들을 연결할 선 배열
let redLinePath = []; // 소실 신호 예측 위치들을 연결할 선 배열
let greenPolyline = null;
let redPolyline = null;

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

// 인포윈도우 표시 함수
const makeOverListener = (map, marker, infowindow) => {
  return function () {
    infowindow.open(map, marker);
  };
};

// 인포윈도우 제거 함수
const makeOutListener = (infowindow) => {
  return function () {
    infowindow.close();
  };
};

// 해당 선박의 상세정보를 위해 선박 최신 ais 데이터 요청
const getShip = (setShip, mmsi) => {
  axios
    .get('/api/ship/mmsi/' + mmsi)
    .then((response) => {
      setShip(response.data);
    })
    .catch((error) => console.log(error));
};

// 경로를 보여주기 위해 해당 선박의 모든 ais 데이터 요청
const getRoute = (setRoute, mmsi) => {
  axios
    .get('/api/ship/route/' + mmsi)
    .then((response) => {
      setRoute(response.data);
    })
    .catch((error) => console.log(error));
};

// 신호가 소실된 선박이라면 예측 데이터 요청
const getPredictedAis = (setPredicted, mmsi) => {
  axios
    .get('/api/predict/ship/' + mmsi)
    .then((response) => {
      setPredicted(response.data);
    })
    .catch((error) => console.log(error));
};

const ShipRoute = () => {
  const [route, setRoute] = useState([]);
  const [ship, setShip] = useState({});
  const [predicted, setPredicted] = useState([]);
  const [kakaoMap, setKakaoMap] = useState(null);

  const { mmsi } = useParams();
  const location = useLocation();
  const { posX, posY } = location.state;

  // 마커 이미지
  const cargoImage = 'https://cdn-icons-png.flaticon.com/512/9565/9565467.png'; // 화물선
  const tankerImage = 'https://cdn-icons-png.flaticon.com/512/2942/2942056.png'; // 유조선
  const lossImage = 'https://cdn-icons-png.flaticon.com/512/3967/3967841.png';
  const greenCircle = 'https://img.icons8.com/emoji/256/green-circle-emoji.png';
  const redCircle = 'https://img.icons8.com/emoji/256/red-circle-emoji.png';

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

    // 최초 실행시 요청
    getShip(setShip, mmsi);
    getRoute(setRoute, mmsi);
    getPredictedAis(setPredicted, mmsi);

    // 10초마다 지속적으로 요청
    const timer = setInterval(() => {
      getShip(setShip, mmsi);
      getRoute(setRoute, mmsi);
      getPredictedAis(setPredicted, mmsi);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (kakaoMap === null) {
      return;
    }

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

    // route에 mapping되는 마커를 표시할 위치 배열
    let positions = [];
    positions = route.map((ship) => [
      ...positions,
      {
        content: ship,
        latlng: new kakao.maps.LatLng(ship.posY, ship.posX),
      },
    ]);

    // 예측 데이터 마커를 표시할 위치 배열
    let predictedPositions = [];
    predictedPositions = predicted.map((ship) => [
      ...predictedPositions,
      {
        mmsi: ship.mmsi,
        cog: ship.cog,
        sog: ship.sog,
        predict_date: ship.predict_date,
        latlng: new kakao.maps.LatLng(ship.posY, ship.posX),
      },
    ]);

    // 마커 이미지 크기
    const circleImageSize = new kakao.maps.Size(12, 12);
    const shipImageSize = new kakao.maps.Size(20, 25);

    // 마커 초기화
    for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    markers.length = 0;

    // 예측 마커 초기화
    for (let i = 0; i < predictedMarkers.length; i++) {
      predictedMarkers[i].setMap(null);
    }
    predictedMarkers.length = 0;

    // 인포윈도우 초기화
    for (let i = 0; i < infowindows.length; i++) {
      infowindows[i].setMap(null);
    }
    infowindows.length = 0;

    // 예측 인포윈도우 초기화
    for (let i = 0; i < predictedInfowindows.length; i++) {
      predictedInfowindows[i].setMap(null);
    }
    predictedInfowindows.length = 0;

    // 정상 신호 위치 배열 초기화
    greenLinePath.length = 0;

    // 예측 신호 위치 배열 초기화
    redLinePath.length = 0;

    // 정상 신호 폴리라인 초기화
    greenPolyline !== null && greenPolyline.setMap(null);

    // 예측 신호 폴리라인 초기화
    redPolyline !== null && redPolyline.setMap(null);

    // 정상 신호 위치 마커 생성
    for (let i = 0; i < positions.length; i++) {
      // 정상 신호 위치를 연결할 선의 좌표 배열에 저장
      positions[i][0].content &&
        greenLinePath.push(
          new kakao.maps.LatLng(
            positions[i][0].content.posY,
            positions[i][0].content.posX,
          ),
        );

      // 마커 이미지 생성
      let markerImage;
      i !== positions.length - 1
        ? (markerImage = new kakao.maps.MarkerImage(
            greenCircle,
            circleImageSize,
          ))
        : positions[i][0].content.aisKey.ship.shipType === 70
        ? (markerImage = new kakao.maps.MarkerImage(cargoImage, shipImageSize))
        : (markerImage = new kakao.maps.MarkerImage(
            tankerImage,
            shipImageSize,
          ));

      // 마커 생성
      let marker = new kakao.maps.Marker({
        map: kakaoMap, // 마커를 표시할 지도
        position: positions[i][0].latlng, // 마커를 표시할 위치
        image: markerImage, // 마커 이미지
      });

      markers.push(marker);

      // 마커에 커서가 오버됐을 때 마커 위에 표시할 인포윈도우 생성
      let iwContent = `
      <div style="padding:5px; font-size:14px; height:80px; width:230px;">
        <div>
          <span style="font-weight:bold;">Signal_date</span>
          <span>${moment(positions[i][0].content.aisKey.signal_date)
            .subtract(9, 'hour')
            .format('YYYY-MM-DD HH:mm:ss')}</span>
        </div>
        <div>
          <span style="font-weight:bold;">위도</span>
          <span>${positions[i][0].content.posY.toFixed(6)}</span>
        </div> 
        <div>
          <span style="font-weight:bold;">경도</span>
          <span>${positions[i][0].content.posX.toFixed(6)}</span>
        </div>
      </div>
      `;

      // 마커에 표시할 인포윈도우 생성
      let infowindow = new kakao.maps.InfoWindow({
        content: iwContent, // 인포윈도우에 표시할 내용
      });

      infowindows.push(infowindow);

      // 마커에 mouseover 이벤트와 mouseout 이벤트 등록
      kakao.maps.event.addListener(
        marker,
        'mouseover',
        makeOverListener(kakaoMap, marker, infowindow),
      );
      kakao.maps.event.addListener(
        marker,
        'mouseout',
        makeOutListener(infowindow),
      );
    }

    // 예측 데이터 마커 생성
    for (let i = 0; i < predictedPositions.length; i++) {
      // 예측 신호 위치를 연결할 선의 좌표 배열에 저장
      predictedPositions[i][0].latlng &&
        redLinePath.push(predictedPositions[i][0].latlng);

      // 마커 이미지 생성
      let markerImage;
      i !== predictedPositions.length - 1
        ? (markerImage = new kakao.maps.MarkerImage(redCircle, circleImageSize))
        : (markerImage = new kakao.maps.MarkerImage(lossImage, shipImageSize));

      // 마커 생성
      let marker = new kakao.maps.Marker({
        map: kakaoMap, // 마커를 표시할 지도
        position: predictedPositions[i][0].latlng, // 마커를 표시할 위치
        image: markerImage, // 마커 이미지
      });

      predictedMarkers.push(marker);

      // 마커에 커서가 오버됐을 때 마커 위에 표시할 인포윈도우 생성
      let iwContent = `
      <div style="padding:5px; font-size:14px; height:80px; width:230px;">
        <div>
          <span style="font-weight:bold;">Predict_date</span>
          <span>${moment(predictedPositions[i][0].predict_date)
            .subtract(9, 'hour')
            .format('YYYY-MM-DD HH:mm:ss')}</span>
        </div>
        <div>
          <span style="font-weight:bold;">위도</span>
          <span>${predictedPositions[i][0].latlng.Ma}</span>
        </div> 
        <div>
          <span style="font-weight:bold;">경도</span>
          <span>${predictedPositions[i][0].latlng.La}</span>
        </div>
      </div>
      `;

      // 마커에 표시할 인포윈도우 생성
      let infowindow = new kakao.maps.InfoWindow({
        content: iwContent, // 인포윈도우에 표시할 내용
      });

      predictedInfowindows.push(infowindow);

      // 마커에 mouseover 이벤트와 mouseout 이벤트 등록
      kakao.maps.event.addListener(
        marker,
        'mouseover',
        makeOverListener(kakaoMap, marker, infowindow),
      );
      kakao.maps.event.addListener(
        marker,
        'mouseout',
        makeOutListener(infowindow),
      );
    }

    // 정상 신호 위치 연결하는 선 생성
    greenPolyline = new kakao.maps.Polyline({
      map: kakaoMap,
      path: greenLinePath,
      strokeWeight: 5,
      strokeColor: '#9ACD32',
      strokeOpacity: 0.7,
      strokeStyle: 'solid',
    });

    // 신호 소실 선박의 예측 위치 연결하는 선 생성
    redPolyline = new kakao.maps.Polyline({
      map: kakaoMap,
      path: redLinePath,
      strokeWeight: 5,
      strokeColor: '#FF0000',
      strokeOpacity: 0.7,
      strokeStyle: 'solid',
    });
  }, [route]);

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
        <DetailRoute ship={ship} />
      </DetailStyle>
    </>
  );
};

export default ShipRoute;
