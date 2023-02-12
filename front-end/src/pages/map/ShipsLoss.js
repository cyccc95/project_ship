import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const { kakao } = window;
let markers = []; // 마커를 저장할 배열
let infowindows = []; // 인포윈도우를 저장할 배열

// 인포윈도우를 표시 함수
const makeOverListener = (map, marker, infowindow) => {
  return function () {
    infowindow.open(map, marker);
  };
};

// 인포윈도우를 제거 함수
const makeOutListener = (infowindow) => {
  return function () {
    infowindow.close();
  };
};

// 신호 소실 선박들 데이터 요청
const getShips = (setShips) => {
  axios
    .get('/api/ships/loss')
    .then((response) => {
      setShips(response.data);
    })
    .catch((error) => console.log(error));
};

const ShipsLoss = () => {
  const [ships, setShips] = useState([]);
  const [kakaoMap, setKakaoMap] = useState(null);

  const navigate = useNavigate();

  // 마커 이미지
  const lossImage = 'https://cdn-icons-png.flaticon.com/512/3967/3967841.png'; // 신호 소실 선박

  useEffect(() => {
    // 최초 한번 지도 랜더링
    kakao.maps.load(() => {
      const mapContainer = document.getElementById('map');
      const mapOptions = {
        center: new kakao.maps.LatLng(35.050701, 129.170667),
        level: 10,
      };
      const map = new kakao.maps.Map(mapContainer, mapOptions);

      setKakaoMap(map);
    });

    // 최초 실행시 요청
    getShips(setShips);

    // 10초마다 지속적으로 요청
    const timer = setInterval(() => {
      getShips(setShips);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (kakaoMap === null) {
      return;
    }

    // ships에 mapping되는 마커를 표시할 위치 배열
    let positions = [];
    positions = ships.map((ship) => [
      ...positions,
      {
        content: ship,
        latlng: new kakao.maps.LatLng(ship.posY, ship.posX),
      },
    ]);

    // 마커 이미지 크기
    const imageSize = new kakao.maps.Size(24, 30);

    // 마커 초기화
    for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    markers.length = 0;

    // 인포윈도우 초기화
    for (let i = 0; i < infowindows.length; i++) {
      infowindows[i].setMap(null);
    }
    infowindows.length = 0;

    // positions 배열으로 마커 생성
    for (let i = 0; i < positions.length; i++) {
      // 현재 시간을 담은 변수 생성하고 각각 선박마다 signal_date 가져옴
      let currentTime = moment();
      let shipSignalTime = moment();
      positions[i][0].content &&
        (shipSignalTime = moment(positions[i][0].content.aisKey.signal_date)
          .subtract(9, 'hour')
          .format('YYYY-MM-DD HH:mm:ss'));

      // 현재 시간과 마지막 신호 시간의 차이를 계산하여 소실 신호라 판단되면 예측하도록 요청
      // 신호가 소실되지 않았거나 소실되었다가 다시 정상 신호가 들어오면 예측했던 데이터 삭제 요청
      moment.duration(currentTime.diff(shipSignalTime)).asMinutes() >= 5
        ? positions[i][0].content &&
          moment.duration(currentTime.diff(shipSignalTime)).asMinutes() <= 30 &&
          axios
            .post(
              '/api/predict/ship/' + positions[i][0].content.aisKey.ship.mmsi,
            )
            .then((response) => {})
            .catch((error) => console.log(error))
        : positions[i][0].content &&
          axios
            .delete(
              '/api/predict/ship/' + positions[i][0].content.aisKey.ship.mmsi,
            )
            .then((response) => {})
            .catch((error) => console.log(error));

      // 마커 이미지 생성
      let markerImage = new kakao.maps.MarkerImage(lossImage, imageSize);

      // 마커 생성
      let marker = new kakao.maps.Marker({
        map: kakaoMap, // 마커를 표시할 지도
        position: positions[i][0].latlng, // 마커를 표시할 위치
        image: markerImage, // 마커 이미지
        clickable: true, // 클릭 기능 여부
      });

      // 생성한 마커를 markers에 저장
      markers.push(marker);

      // 마커에 커서가 오버됐을 때 마커 위에 표시할 인포윈도우 생성
      let iwContent = `
      <div style="padding:5px;">
        <div>
          <span style="font-weight:bold">MMSI</span>
          <span>${positions[i][0].content.aisKey.ship.mmsi}</span>
        </div>
        <div>
          <span style="font-weight:bold">ShipType</span>
          <span>${
            positions[i][0].content.aisKey.ship.shipType === 70
              ? '화물선'
              : '유조선'
          }</span>
        </div>
      </div>
      `;

      // 마커에 표시할 인포윈도우를 생성합니다
      let infowindow = new kakao.maps.InfoWindow({
        content: iwContent, // 인포윈도우에 표시할 내용
      });

      // infowindow를 infowindows 배열에 저장
      infowindows.push(infowindow);

      // 마커에 mouseover 이벤트와 mouseout 이벤트를 등록
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

      // 마커에 클릭이벤트 등록
      // 마커 클릭시 해당 선박과 상세정보가 표시되는 페이지로 이동
      kakao.maps.event.addListener(marker, 'click', function () {
        navigate('/ship/' + positions[i][0].content.aisKey.ship.mmsi, {
          state: {
            posX: positions[i][0].content.posX,
            posY: positions[i][0].content.posY,
          },
        });
      });
    }
  }, [ships]);

  return (
    <>
      <div
        id="map"
        style={{
          width: '100vw',
          height: '100vh',
        }}
      ></div>
    </>
  );
};

export default ShipsLoss;
