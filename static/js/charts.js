let globalData = [];

// Fetch data and create charts
fetch('/api/data')
    .then(response => response.json())
    .then(data => {
        globalData = data;
        createCharts(data);
        populateFilters(data);

        // Add event listeners after populating filters
        document.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', updateCharts);
            console.log(`Event listener added for ${select.id}`);
        });
    });

function createCharts(data) {
    d3.select('#intensity-chart').html(''); // Clear previous chart
    d3.select('#likelihood-relevance-chart').html(''); // Clear previous chart
    d3.select('#topics-chart').html(''); // Clear previous chart
    
    createIntensityChart(data);
    createLikelihoodRelevanceChart(data);
    createTopicsChart(data);
}

function createIntensityChart(data) {
    const width = 300;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const svg = d3.select('#intensity-chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const intensityData = d3.rollups(data, v => v.length, d => d.intensity)
        .sort((a, b) => d3.ascending(a[0], b[0]));

    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .range([height, 0]);

    x.domain(intensityData.map(d => d[0]));
    y.domain([0, d3.max(intensityData, d => d[1])]);

    svg.selectAll('.bar')
        .data(intensityData)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d[0]))
        .attr('width', x.bandwidth())
        .attr('y', d => y(d[1]))
        .attr('height', d => height - y(d[1]))
        .attr('fill', '#6c5ce7');

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append('g')
        .call(d3.axisLeft(y));
}

function createLikelihoodRelevanceChart(data) {
    const width = 300;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const svg = d3.select('#likelihood-relevance-chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.likelihood)])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.relevance)])
        .range([height, 0]);

    svg.selectAll('.dot')
        .data(data)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(d.likelihood))
        .attr('cy', d => y(d.relevance))
        .attr('r', 3)
        .attr('fill', '#e74c3c');

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append('g')
        .call(d3.axisLeft(y));
}

function createTopicsChart(data) {
    const width = 300;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const svg = d3.select('#topics-chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const topicData = d3.rollups(data, v => v.length, d => d.topic)
        .sort((a, b) => d3.descending(a[1], b[1]))
        .slice(0, 10);

    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .range([height, 0]);

    x.domain(topicData.map(d => d[0]));
    y.domain([0, d3.max(topicData, d => d[1])]);

    svg.selectAll('.bar')
        .data(topicData)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d[0]))
        .attr('width', x.bandwidth())
        .attr('y', d => y(d[1]))
        .attr('height', d => height - y(d[1]))
        .attr('fill', '#00cec9');

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    svg.append('g')
        .call(d3.axisLeft(y));
}

function populateFilters(data) {
    const endYearSet = new Set(data.map(d => d.end_year).filter(d => d));
    const topicSet = new Set(data.map(d => d.topic).filter(d => d));
    const sectorSet = new Set(data.map(d => d.sector).filter(d => d));
    const regionSet = new Set(data.map(d => d.region).filter(d => d));
    const pestleSet = new Set(data.map(d => d.pestle).filter(d => d));
    const sourceSet = new Set(data.map(d => d.source).filter(d => d));
    const countrySet = new Set(data.map(d => d.country).filter(d => d));

    const populateOptions = (selectId, options) => {
        const select = document.getElementById(selectId);
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.innerHTML = option;
            select.appendChild(opt);
        });
    };

    populateOptions('end-year', endYearSet);
    populateOptions('topic', topicSet);
    populateOptions('sector', sectorSet);
    populateOptions('region', regionSet);
    populateOptions('pestle', pestleSet);
    populateOptions('source', sourceSet);
    populateOptions('country', countrySet);
}

function updateCharts() {
    console.log('Updating charts...');
    
    const endYear = document.getElementById('end-year').value;
    const topic = document.getElementById('topic').value;
    const sector = document.getElementById('sector').value;
    const region = document.getElementById('region').value;
    const pestle = document.getElementById('pestle').value;
    const source = document.getElementById('source').value;
    const country = document.getElementById('country').value;

    let filteredData = globalData;

    if (endYear) filteredData = filteredData.filter(d => d.end_year === endYear);
    if (topic) filteredData = filteredData.filter(d => d.topic === topic);
    if (sector) filteredData = filteredData.filter(d => d.sector === sector);
    if (region) filteredData = filteredData.filter(d => d.region === region);
    if (pestle) filteredData = filteredData.filter(d => d.pestle === pestle);
    if (source) filteredData = filteredData.filter(d => d.source === source);
    if (country) filteredData = filteredData.filter(d => d.country === country);

    console.log('Filtered data:', filteredData);

    createCharts(filteredData);
}
