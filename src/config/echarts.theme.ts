export default {
  color: ['#2F82FF', '#22c3aa', '#7bd9a5'],
  backgroundColor: 'rgba(0,0,0,0)',
  textStyle: {},
  title: {
    textStyle: {
      color: '#666666',
    },
    subtextStyle: {
      color: '#999999',
    },
  },
  bar: {
    itemStyle: {
      barBorderWidth: '0',
      barBorderColor: '#444444',
    },

    emphasis: {
      itemStyle: {
        barBorderWidth: '0',
        barBorderColor: '#444444',
      },
    },
    barWidth: '8px',
  },

  categoryAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: '#cccccc',
      },
    },
    axisLabel: {
      show: true,
      color: '#fafafa',
    },
    splitLine: {
      show: false,
      lineStyle: {
        color: ['rgba(250,250,250,0.12)'],
        type: 'dashed',
      },
    },
  },
  valueAxis: {
    axisLabel: {
      show: true,
      color: '#fafafa',
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['rgba(250,250,250,0.12)'],
      },
    },
  },
  tooltip: {
    axisPointer: {
      lineStyle: {
        color: '#ccc',
        width: 1,
      },
      crossStyle: {
        color: '#ccc',
        width: 1,
      },
    },
    borderColor: '#86A8FF',
    backgroundColor: '#123965',
    textStyle: {
      color: '#fff',
    },
    padding: [5, 10],
  },
}
