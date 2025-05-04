document.getElementById("fileInput").addEventListener("change", handleFile);

function handleFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const text = e.target.result;
    const rows = text.split("\n").slice(1); // skip header
    const labels = [];
    const data = [];

    rows.forEach(row => {
      const [year, population] = row.split(",");
      if (year && population) {
        labels.push(year.trim());
        data.push(parseInt(population.trim()));
      }
    });

    drawChart(labels, data);
  };

  reader.readAsText(file);
}

function drawChart(labels, data) {
  const ctx = document.getElementById("populationChart").getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Населення",
        data: data,
        fill: false,
        borderColor: "#0077cc",
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
