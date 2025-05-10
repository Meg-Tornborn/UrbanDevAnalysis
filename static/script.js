let charts = {};
let select = document.getElementById('CitySelect');

document.getElementById('csvFile').addEventListener('change', e => {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append('file', file);
  fetch('/upload', { method: 'POST', body: formData })
    .then(res => res.json())
    .then(data => {
      select.innerHTML = '';
      data.countries.forEach(c => {
        const option = document.createElement('option');
        option.value = c;
        option.textContent = c;
        select.appendChild(option);
      });
      select.addEventListener('change', fetchData);
      fetchData();
    });
});

function fetchData() {
  const selectedCountries = [...select.selectedOptions].map(option => option.value);
  if (selectedCountries.length === 0) return;
  fetch('/data?countries[]=' + selectedCountries.join('&countries[]='), { method: 'GET' })
    .then(response => response.json())
    .then(data => drawAllCharts(data));
}

function drawAllCharts(data) {
  window.lastData = data; // <--- ЗБЕРЕЖЕННЯ останніх даних

  ['populationChart', 'schoolsChart', 'hospitalsChart', 'roadsChart'].forEach(id => {
    if (charts[id]) charts[id].destroy();
    charts[id] = null; // очистити, щоб при показі вкладки малювався знову
  });

  // Активна вкладка — змалювати одразу
  const activeTab = document.querySelector('.tab-content.active');
  if (activeTab) {
    const canvasId = activeTab.id.replace('Tab', 'Chart');
    const labels = [...new Set(data.map(d => d.Year))];
    const groupBy = key => {
      return Object.fromEntries(
        [...new Set(data.map(d => d.City))].map(City => [
          City,
          data.filter(d => d.City === City).map(d => d[key] ?? null)
        ])
      );
    };

    if (canvasId === 'populationChart')
      charts[canvasId] = drawChart(canvasId, 'Населення', labels, groupBy('Population'));
    if (canvasId === 'schoolsChart')
      charts[canvasId] = drawChart(canvasId, 'Школи на 100к', labels, groupBy('Infrastructure.Schools.Per100k'));
    if (canvasId === 'hospitalsChart')
      charts[canvasId] = drawChart(canvasId, 'Лікарні на 100к', labels, groupBy('Infrastructure.Hospitals.Per100k'));
    if (canvasId === 'roadsChart')
      charts[canvasId] = drawChart(canvasId, 'Дороги (км/люд.)', labels, groupBy('Infrastructure.RoadLength.KmPerCapita'));
  }

  document.getElementById('table').innerHTML = '';
  new gridjs.Grid({
    columns: Object.keys(data[0]),
    data: data.map(d => Object.values(d)),
    pagination: true,
    search: true
  }).render(document.getElementById('table'));
}


function drawChart(id, label, labels, datasetsObj) {
  const datasets = Object.entries(datasetsObj).map(([City, data]) => ({
    label: City,
    data: data,
    borderWidth: 2,
    fill: false
  }));

  const ctx = document.getElementById(id).getContext('2d');
  return new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: label }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function toggleTheme() {
  document.body.classList.toggle('dark');
}

document.querySelectorAll('#tabs ul li a').forEach(tabLink => {
  tabLink.addEventListener('click', function(e) {
    e.preventDefault();
    const tabId = this.getAttribute('href').substring(1);

    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');

    const canvasId = tabId.replace('Tab', 'Chart');

    // Якщо графіка ще немає — створити з останніми даними
    if (!charts[canvasId] && window.lastData) {
      const labels = [...new Set(window.lastData.map(d => d.Year))];
      const groupBy = key => {
        return Object.fromEntries(
          [...new Set(window.lastData.map(d => d.City))].map(City => [
            City,
            window.lastData.filter(d => d.City === City).map(d => d[key] ?? null)
          ])
        );
      };

      if (canvasId === 'populationChart')
        charts[canvasId] = drawChart(canvasId, 'Населення', labels, groupBy('Population'));
      if (canvasId === 'schoolsChart')
        charts[canvasId] = drawChart(canvasId, 'Школи на 100к', labels, groupBy('Infrastructure.Schools.Per100k'));
      if (canvasId === 'hospitalsChart')
        charts[canvasId] = drawChart(canvasId, 'Лікарні на 100к', labels, groupBy('Infrastructure.Hospitals.Per100k'));
      if (canvasId === 'roadsChart')
        charts[canvasId] = drawChart(canvasId, 'Дороги (км/люд.)', labels, groupBy('Infrastructure.RoadLength.KmPerCapita'));
    }

    // І resize/update
    const chart = charts[canvasId];
    if (chart) {
      setTimeout(() => {
        chart.resize();
        chart.update();
      }, 100);
    }
  });
});


