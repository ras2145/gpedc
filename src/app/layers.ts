export let layers = {
    'percent' : {
        'id': 'country-fills',
        'source': 'countries',
        'type': 'fill',
        'paint': {
          'fill-color': {
            property: '',
            stops: [
              [0.20, '#F16950'],
              [0.40, '#F69229'],
              [0.60, '#FAD02F'],
              [0.80, '#B1D781'],
              [1, '#1FAB9E']
            ]
          },
          'fill-opacity': 0.75

        }
      },
    'indicator4' : {
        'id': 'country-fills',
        'source': 'countries',
        'type': 'fill',
        'paint': {
          'fill-color': {
            property: '',
            type: 'categorical',
            stops: [
              ['Needs Improvement', '#F16950'],
              ['Fair', '#F69229'],
              ['Good', '#B1D781'],
              ['Excellent', '#1FAB9E']
            ]
          },
          'fill-opacity': 0.75
        }
    },
    'yesNo' : {
        'id': 'country-fills',
        'source': 'countries',
        'type': 'fill',
        'paint': {
          'fill-color': {
            property: '',
            type: 'categorical',
            stops: [
              ['Yes', '#1FAB9E'],
              ['No', '#F16950']
            ]
          },
          'fill-opacity': 0.75
        }
    },
    'indicator9a': {
        'id': 'country-fills',
        'source': 'countries',
        'type': 'fill',
        'paint': {
          'fill-color': {
            property: '',
            stops: [
              [1, '#e17058'],
              [1.5, '#E19469'],
              [2, '#e99643'],
              [2.5, '#E9BB64'],
              [3, '#f4d053'],
              [3.5, '#E6F477'],
              [4, '#b9d58a'],
              [4.5, '#86D584'],
              [5, '#50a89e'],
              [5.5, '#599BA8'],
              [6, '#5878A8']
            ]
          },
          'fill-opacity': 0.75
        }
    },
    'indicator3': {
        'id': 'country-fills',
        'source': 'countries',
        'type': 'fill',
        'paint': {
          'fill-color': {
            property: '',
            stops: [
              [0, '#F16950'],
              [3, '#F69229'],
              [5, '#FAD02F'],
              [7, '#B1D781'],
              [9, '#1FAB9E'],
            ]
          },
          'fill-opacity': 0.75
        }
    },
    'indicator2_1' : {
        'id': 'country-fills',
        'source': 'countries',
        'type': 'fill',
        'paint': {
          'fill-color': {
            property: '',
            stops: [
              [1, '#F16950'],
              [2, '#FAD02F'],
              [3, '#1FAB9E']
            ]
          },
          'fill-opacity': 0.75
        }
    },
    'indicator2_2' : {
        'id': 'country-fills',
        'source': 'countries',
        'type': 'fill',
        'paint': {
          'fill-color': {
            property: '',
            stops: [
              [1, '#F16950'],
              [2, '#F69229'],
              [3, '#FAD02F'],
              [4, '#B1D781'],
              [5, '#1FAB9E']
            ]
          },
          'fill-opacity': 0.75
        }
    },
    'indicator2_34' : {
        'id': 'country-fills',
        'source': 'countries',
        'type': 'fill',
        'paint': {
          'fill-color': {
            property: '',
            stops: [
              [1, '#F16950'],
              [2, '#F69229'],
              [3, '#B1D781'],
              [4, '#1FAB9E']
            ]
          },
          'fill-opacity': 0.75
        }
    }
};
