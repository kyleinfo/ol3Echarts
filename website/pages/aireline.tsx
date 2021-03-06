import * as React from 'react';
import { Map, View } from 'ol';
import { Tile as TileLayer } from 'ol/layer';
import { XYZ } from 'ol/source';
import EChartsLayer from 'ol-echarts';

import { getJSON } from '../helper';

interface PageProps {
  chart: any[];
}

interface PageState {
  zoom: number;
  rotation: number;
  center: number[];
}

function getAirportCoord(data: any, idx: number) {
  return [data.airports[idx][3], data.airports[idx][4]];
}

class Index extends React.Component<PageProps, PageState> {
  private map: any | null;

  private chart: any | null;

  private container: React.RefObject<HTMLDivElement>;

  constructor(props: PageProps, context: any) {
    super(props, context);
    this.state = {
      zoom: 5,
      rotation: 0,
      center: [113.53450137499999, 34.44104525],
    };

    this.container = React.createRef();
    this.map = null;
  }

  componentDidMount() {
    if (this.container.current) {
      this.map = new Map({
        target: this.container.current,
        view: new View({
          ...this.state,
          projection: 'EPSG:4326',
        }),
        layers: [
          new TileLayer({
            source: new XYZ({
              url: 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnline'
                + 'StreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',
            }),
          }),
        ],
      });

      this.chart = new EChartsLayer(null, {
        hideOnMoving: false,
        hideOnZooming: false,
      });

      this.chart.appendTo(this.map);

      getJSON('../../json/flights.json', (data: any) => {
        const routes = data.routes.map((airline: number[]) => [
          getAirportCoord(data, airline[1]),
          getAirportCoord(data, airline[2]),
        ]);

        const option = {
          title: {
            text: '航线',
            left: 'center',
            textStyle: {
              color: '#eee',
            },
          },
          backgroundColor: 'transparent',
          tooltip: {
            formatter(param: any) {
              const route = data.routes[param.dataIndex];
              return `${data.airports[route[1]][1]} > ${data.airports[route[2]][1]}`;
            },
          },
          series: [{
            type: 'lines',
            data: routes,
            large: true,
            largeThreshold: 100,
            lineStyle: {
              normal: {
                opacity: 0.05,
                width: 0.5,
                curveness: 0.3,
              },
            },
            // 设置混合模式为叠加
            blendMode: 'lighter',
          }],
        };

        this.chart.setChartOptions(option);
      });
    }
  }

  render() {
    return (<div ref={this.container} className="map-content" />);
  }
}

export default Index;
